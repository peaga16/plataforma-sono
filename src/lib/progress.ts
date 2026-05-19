import { prisma } from "@/lib/prisma";

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

// Retorna progresso do ciclo atual
export async function getUserProgress(userId: string) {
  const currentCycle = await getCurrentCycle(userId);
  const progress = await prisma.progress.findMany({
    where: { userId, cycle: currentCycle },
  });
  return { progress, currentCycle };
}

// Retorna todo o histórico para o dashboard
export async function getAllCyclesProgress(userId: string) {
  return prisma.progress.findMany({
    where: { userId, completed: true },
    orderBy: [{ cycle: "asc" }, { day: "asc" }],
  });
}

export function isDayUnlocked(day: number, completedDays: number[]) {
  if (day === 1) return true;
  return completedDays.includes(day - 1);
}
