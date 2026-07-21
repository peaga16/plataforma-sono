import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentCycle, getDayUnlockStatus } from "@/lib/progress";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const day = Number(searchParams.get("day"));

  if (!day || day < 1 || day > 7) {
    return NextResponse.json({ error: "Dia inválido." }, { status: 400 });
  }

  const userId = session.user.id;
  const currentCycle = await getCurrentCycle(userId);

  const cycleProgress = await prisma.progress.findMany({
    where: { userId, cycle: currentCycle },
    select: { day: true, completed: true, completedAt: true },
  });

  const previousCycleDay7 =
    currentCycle > 1
      ? await prisma.progress.findUnique({
          where: { userId_day_cycle: { userId, day: 7, cycle: currentCycle - 1 } },
          select: { day: true, completed: true, completedAt: true },
        })
      : null;

  const status = getDayUnlockStatus(day, cycleProgress, previousCycleDay7);

  return NextResponse.json({
    unlocked: status.unlocked,
    availableAt: status.availableAt ? status.availableAt.toISOString() : null,
  });
}
