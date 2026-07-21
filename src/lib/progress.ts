import { prisma } from "@/lib/prisma";
import { isCycleComplete } from "@/lib/progress-rules";

// Descobre o ciclo atual.
// A busca considera qualquer registro do ciclo mais recente, inclusive registros
// ainda não concluídos. Isso impede que o sistema volte a usar o ciclo anterior
// quando um novo ciclo já foi criado, mas ainda não possui dias completos.
export async function getCurrentCycle(userId: string): Promise<number> {
  const latestProgress = await prisma.progress.findFirst({
    where: { userId },
    orderBy: [{ cycle: "desc" }, { day: "desc" }],
    select: { cycle: true },
  });

  if (!latestProgress) return 1;

  const latestCycle = latestProgress.cycle;
  const completedRecords = await prisma.progress.findMany({
    where: { userId, cycle: latestCycle, completed: true },
    select: { day: true },
  });

  const completedDays = completedRecords.map((record) => record.day);

  // Só avança quando os sete dias válidos do ciclo foram realmente concluídos.
  return isCycleComplete(completedDays) ? latestCycle + 1 : latestCycle;
}

// Retorna exclusivamente o progresso do ciclo atual.
export async function getUserProgress(userId: string) {
  const currentCycle = await getCurrentCycle(userId);
  const progress = await prisma.progress.findMany({
    where: { userId, cycle: currentCycle },
    orderBy: { day: "asc" },
  });

  return { progress, currentCycle };
}

// Retorna todo o histórico para o dashboard.
export async function getAllCyclesProgress(userId: string) {
  return prisma.progress.findMany({
    where: { userId, completed: true },
    orderBy: [{ cycle: "asc" }, { day: "asc" }],
  });
}
