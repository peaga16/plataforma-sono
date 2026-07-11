import { prisma } from "@/lib/prisma";

// Regras de liberação:
// - Todos os dias do ciclo atual estão liberados imediatamente (sem restrição de 24h entre dias).
// - O dia 1 de um novo ciclo só libera 7 dias depois da conclusão do dia 7 do ciclo anterior.
export const DAY_UNLOCK_HOURS = 0; // Não mais usamos 24h entre dias
export const WEEK_UNLOCK_DAYS = 7; // 7 dias entre ciclos

const DAY_UNLOCK_MS = DAY_UNLOCK_HOURS * 60 * 60 * 1000;
const WEEK_UNLOCK_MS = WEEK_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

export type ProgressRecord = {
  day: number;
  completed: boolean;
  completedAt: Date | null;
};

export interface DayUnlockStatus {
  unlocked: boolean;
  // Quando o dia libera. null = já liberado, ou não há previsão (ex: dia 1 do primeiro ciclo).
  availableAt: Date | null;
}

// Descobre o ciclo atual:
// - Se o ciclo mais recente tem os 7 dias completos → novo ciclo (+ 1)
// - Caso contrário → ciclo mais recente
export async function getCurrentCycle(userId: string): Promise<number> {
  const last = await prisma.progress.findFirst({
    where: { userId, completed: true },
    orderBy: { cycle: "desc" },
  });

  if (!last) return 1; // nunca fez nada ainda

  const lastCycle = last.cycle;

  // Conta quantos dias completos existem no ciclo mais recente
  const completedInCycle = await prisma.progress.count({
    where: { userId, cycle: lastCycle, completed: true },
  });

  // Se completou todos os 7 dias, próximo ciclo
  if (completedInCycle >= 7) return lastCycle + 1;

  return lastCycle;
}

// Busca o registro do dia 7 do ciclo anterior (usado para liberar o dia 1 do ciclo atual).
async function getPreviousCycleDay7(
  userId: string,
  cycle: number
): Promise<ProgressRecord | null> {
  if (cycle <= 1) return null;
  return prisma.progress.findUnique({
    where: { userId_day_cycle: { userId, day: 7, cycle: cycle - 1 } },
    select: { day: true, completed: true, completedAt: true },
  });
}

// Retorna progresso do ciclo atual + o dia 7 do ciclo anterior (para calcular liberação).
export async function getUserProgress(userId: string) {
  const currentCycle = await getCurrentCycle(userId);
  const progress = await prisma.progress.findMany({
    where: { userId, cycle: currentCycle },
  });
  const previousCycleDay7 = await getPreviousCycleDay7(userId, currentCycle);
  return { progress, currentCycle, previousCycleDay7 };
}

// Retorna todo o histórico para o dashboard
export async function getAllCyclesProgress(userId: string) {
  return prisma.progress.findMany({
    where: { userId, completed: true },
    orderBy: [{ cycle: "asc" }, { day: "asc" }],
  });
}

// Calcula se um dia está liberado, e se não estiver, quando libera.
// `cycleProgress` deve conter os registros do ciclo atual (para checar o dia anterior).
// `previousCycleDay7` é o registro do dia 7 do ciclo anterior (para checar o intervalo de 7 dias).
export function getDayUnlockStatus(
  day: number,
  cycleProgress: ProgressRecord[],
  previousCycleDay7: ProgressRecord | null
): DayUnlockStatus {
  const now = new Date();

  if (day === 1) {
    // Sem ciclo anterior (primeira semana do aluno): libera direto.
    if (!previousCycleDay7?.completed || !previousCycleDay7.completedAt) {
      return { unlocked: true, availableAt: null };
    }
    const availableAt = new Date(
      previousCycleDay7.completedAt.getTime() + WEEK_UNLOCK_MS
    );
    return { unlocked: availableAt.getTime() <= now.getTime(), availableAt };
  }

  // Todos os dias do ciclo atual estão liberados imediatamente
  // (sem necessidade de completar o dia anterior)
  return { unlocked: true, availableAt: null };
}

// Guarda de segurança usada nos endpoints de conclusão (server-side).
// Lança um erro com `availableAt` anexado se o dia ainda não estiver liberado.
export async function assertDayUnlocked(
  userId: string,
  day: number,
  cycle: number
): Promise<void> {
  const cycleProgress = await prisma.progress.findMany({
    where: { userId, cycle },
    select: { day: true, completed: true, completedAt: true },
  });
  const previousCycleDay7 = await getPreviousCycleDay7(userId, cycle);

  const status = getDayUnlockStatus(day, cycleProgress, previousCycleDay7);

  if (!status.unlocked) {
    const error = new Error("DAY_LOCKED") as Error & { availableAt?: Date | null };
    error.availableAt = status.availableAt;
    throw error;
  }
}