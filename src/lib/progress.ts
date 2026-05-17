import { prisma } from "@/lib/prisma";

export async function getUserProgress(userId: string) {
  const progress = await prisma.progress.findMany({
    where: { userId },
  });

  return progress;
}

export function isDayUnlocked(
  day: number,
  completedDays: number[]
) {
  if (day === 1) return true;

  return completedDays.includes(day - 1);
}