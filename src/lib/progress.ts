import { prisma } from "@/lib/prisma";
import {
  isCycleComplete,
  isProgramDay,
} from "@/lib/progress-rules";

// Mantém compatibilidade com possíveis imports antigos.
export { isDayUnlocked } from "@/lib/progress-rules";

// Mantidos por compatibilidade com imports existentes.
// A regra atual deixa todos os dias disponíveis imediatamente.
export const DAY_UNLOCK_HOURS = 0;
export const WEEK_UNLOCK_DAYS = 0;

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
 * Todos os dias válidos do programa ficam liberados imediatamente.
 */
export function getDayUnlockStatus(
  day: number,
  _cycleProgress: ProgressRecord[],
  _previousCycleDay7: ProgressRecord | null
): DayUnlockStatus {
  return {
    unlocked: isProgramDay(day),
    availableAt: null,
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
 * Mantém a validação do número do dia, mas não bloqueia conteúdos válidos.
 */
export async function assertDayUnlocked(
  _userId: string,
  day: number,
  _cycle: number
): Promise<void> {
  if (!isProgramDay(day)) {
    throw new Error("DAY_LOCKED");
  }
}
