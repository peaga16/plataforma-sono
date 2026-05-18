import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/progress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, day } = body;

    if (!code || !day) {
      return NextResponse.json(
        { error: "Código e dia são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Código de atleta não encontrado. Verifique e tente novamente." },
        { status: 404 }
      );
    }

    const currentCycle = await getCurrentCycle(user.id);

    // Verifica se o dia anterior foi concluído no ciclo atual
    if (day > 1) {
      const prevProgress = await prisma.progress.findUnique({
        where: { userId_day_cycle: { userId: user.id, day: day - 1, cycle: currentCycle } },
      });
      if (!prevProgress?.completed) {
        return NextResponse.json(
          { error: `Complete o Dia ${day - 1} antes de acessar este conteúdo.` },
          { status: 403 }
        );
      }
    }

    const progress = await prisma.progress.upsert({
      where: { userId_day_cycle: { userId: user.id, day, cycle: currentCycle } },
      update: { completed: true },
      create: { userId: user.id, day, cycle: currentCycle, completed: true },
    });

    const cycleReset = day === 7;

    return NextResponse.json({
      ...progress,
      athleteName: user.name,
      cycleReset,
      currentCycle,
    });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
