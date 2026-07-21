import { prisma } from "@/lib/prisma";
import {
  isCycleComplete,
  isDayUnlocked as isSequenceUnlocked,
  isProgramDay,
} from "@/lib/progress-rules";

// Mantém compatibilidade com possíveis imports antigos.
export { isDayUnlocked } from "@/lib/progress-rules";

// Regras de liberação:
// - Um novo dia libera 24 horas depois da conclusão do anterior.
// - O Dia 1 de um novo ciclo libera 7 dias após o Dia 7 do ciclo anterior.
export const DAY_UNLOCK_HOURS = 24;
export const WEEK_UNLOCK_DAYS = 7;

const DAY_UNLOCK_MS = DAY_UNLOCK_HOURS * 60 * 60 * 1000;
const WEEK_UNLOCK_MS = WEEK_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

export type ProgressRecord = {
  day: number;
  completed: boolean;
  completedAt: Date | null;
};

export interface DayUnlockStatus {
  unlocked: boolean;
  availableAt: Date | null;
}

/**
 * Descobre o ciclo atual.
 *
 * Considera qualquer registro do ciclo mais recente, mesmo que ainda
 * não esteja concluído. Isso impede o sistema de reutilizar o progresso
 * do ciclo anterior quando um novo ciclo já foi iniciado.
 */
export async function getCurrentCycle(userId: string): Promise<number> {
  const latestProgress = await prisma.progress.findFirst({
    where: { userId },
    orderBy: [{ cycle: "desc" }, { day: "desc" }],
    select: { cycle: true },
  });

  if (!latestProgress) {
    return 1;
  }

  const latestCycle = latestProgress.cycle;

  const completedRecords = await prisma.progress.findMany({
    where: {
      userId,
      cycle: latestCycle,
      completed: true,
    },
    select: {
      day: true,
    },
  });

  const completedDays = completedRecords.map((record) => record.day);

  // Só inicia o ciclo seguinte quando os sete dias válidos
  // do ciclo atual estiverem concluídos.
  return isCycleComplete(completedDays)
    ? latestCycle + 1
    : latestCycle;
}

/**
 * Busca o Dia 7 do ciclo anterior.
 *
 * Ele é utilizado para calcular quando o Dia 1 do novo ciclo
 * ficará disponível.
 */
async function getPreviousCycleDay7(
  userId: string,
  cycle: number
): Promise<ProgressRecord | null> {
  if (cycle <= 1) {
    return null;
  }

  return prisma.progress.findUnique({
    where: {
      userId_day_cycle: {
        userId,
        day: 7,
        cycle: cycle - 1,
      },
    },
    select: {
      day: true,
      completed: true,
      completedAt: true,
    },
  });
}

/**
 * Retorna o progresso exclusivamente do ciclo atual.
 */
export async function getUserProgress(userId: string) {
  const currentCycle = await getCurrentCycle(userId);

  const progress = await prisma.progress.findMany({
    where: {
      userId,
      cycle: currentCycle,
    },
    orderBy: {
      day: "asc",
    },
  });

  const previousCycleDay7 = await getPreviousCycleDay7(
    userId,
    currentCycle
  );

  return {
    progress,
    currentCycle,
    previousCycleDay7,
  };
}

/**
 * Retorna todo o histórico concluído para o dashboard.
 */
export async function getAllCyclesProgress(userId: string) {
  return prisma.progress.findMany({
    where: {
      userId,
      completed: true,
    },
    orderBy: [
      { cycle: "asc" },
      { day: "asc" },
    ],
  });
}

/**
 * Calcula se determinado dia está liberado.
 */
export function getDayUnlockStatus(
  day: number,
  cycleProgress: ProgressRecord[],
  previousCycleDay7: ProgressRecord | null
): DayUnlockStatus {
  const now = new Date();

  if (!isProgramDay(day)) {
    return {
      unlocked: false,
      availableAt: null,
    };
  }

  const currentDay = cycleProgress.find(
    (progress) => progress.day === day
  );

  // Um conteúdo já concluído deve continuar acessível.
  if (currentDay?.completed) {
    return {
      unlocked: true,
      availableAt: null,
    };
  }

  const completedDays = cycleProgress
    .filter((progress) => progress.completed)
    .map((progress) => progress.day);

  /**
   * Dia 1:
   * No primeiro ciclo libera imediatamente.
   * Nos ciclos seguintes, aguarda 7 dias após o Dia 7 anterior.
   */
  if (day === 1) {
    if (
      !previousCycleDay7?.completed ||
      !previousCycleDay7.completedAt
    ) {
      return {
        unlocked: true,
        availableAt: null,
      };
    }

    const availableAt = new Date(
      previousCycleDay7.completedAt.getTime() + WEEK_UNLOCK_MS
    );

    return {
      unlocked: availableAt.getTime() <= now.getTime(),
      availableAt,
    };
  }

  /**
   * Impede que os Dias 2 a 7 sejam liberados com dados incompletos.
   * Todos os dias anteriores do ciclo atual precisam estar concluídos.
   */
  if (!isSequenceUnlocked(day, completedDays)) {
    return {
      unlocked: false,
      availableAt: null,
    };
  }

  const previousDay = cycleProgress.find(
    (progress) => progress.day === day - 1
  );

  if (
    !previousDay?.completed ||
    !previousDay.completedAt
  ) {
    return {
      unlocked: false,
      availableAt: null,
    };
  }

  const availableAt = new Date(
    previousDay.completedAt.getTime() + DAY_UNLOCK_MS
  );

  return {
    unlocked: availableAt.getTime() <= now.getTime(),
    availableAt,
  };
}

/**
 * Registra a conclusão sem alterar completedAt quando o dia já estava concluído.
 * Isso evita reiniciar, por engano, o prazo de liberação do dia seguinte.
 */
export async function completeDayProgress(
  userId: string,
  day: number,
  cycle: number
) {
  const where = {
    userId_day_cycle: { userId, day, cycle },
  };

  const existingProgress = await prisma.progress.findUnique({ where });

  if (existingProgress?.completed) {
    return existingProgress;
  }

  const completedAt = new Date();

  return prisma.progress.upsert({
    where,
    update: { completed: true, completedAt },
    create: { userId, day, cycle, completed: true, completedAt },
  });
}

/**
 * Proteção utilizada pelas APIs de conclusão.
 *
 * Impede que alguém conclua um dia bloqueado enviando
 * uma requisição diretamente para a API.
 */
export async function assertDayUnlocked(
  userId: string,
  day: number,
  cycle: number
): Promise<void> {
  const cycleProgress = await prisma.progress.findMany({
    where: {
      userId,
      cycle,
    },
    select: {
      day: true,
      completed: true,
      completedAt: true,
    },
  });

  const previousCycleDay7 = await getPreviousCycleDay7(
    userId,
    cycle
  );

  const status = getDayUnlockStatus(
    day,
    cycleProgress,
    previousCycleDay7
  );

  if (!status.unlocked) {
    const error = new Error("DAY_LOCKED") as Error & {
      availableAt?: Date | null;
    };

    error.availableAt = status.availableAt;

    throw error;
  }
}