import { prisma } from "@/lib/prisma";

// Descobre o ciclo atual: o maior ciclo com algum progresso, ou 1
export async function getCurrentCycle(userId: string): Promise<number> {
  const last = await prisma.progress.findFirst({
    where: { userId, completed: true },
    orderBy: { cycle: "desc" },
  });
  return last?.cycle ?? 1;
}

// Retorna progresso do ciclo atual
export async function getUserProgress(userId: string) {
  const currentCycle = await getCurrentCycle(userId);
  const progress = await prisma.progress.findMany({
    where: { userId, cycle: currentCycle },
  });
  return { progress, currentCycle };
}

// Retorna todo o histórico de ciclos para o dashboard
export async function getAllCyclesProgress(userId: string) {
  const all = await prisma.progress.findMany({
    where: { userId, completed: true },
    orderBy: [{ cycle: "asc" }, { day: "asc" }],
  });
  return all;
}

export function isDayUnlocked(day: number, completedDays: number[]) {
  if (day === 1) return true;
  return completedDays.includes(day - 1);
}
