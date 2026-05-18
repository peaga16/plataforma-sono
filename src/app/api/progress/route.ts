import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/progress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, day } = body;

    if (!userId || !day) {
      return NextResponse.json(
        { error: "userId e day são obrigatórios" },
        { status: 400 }
      );
    }

    const currentCycle = await getCurrentCycle(userId);

    const progress = await prisma.progress.upsert({
      where: { userId_day_cycle: { userId, day, cycle: currentCycle } },
      update: { completed: true },
      create: { userId, day, cycle: currentCycle, completed: true },
    });

    // Se completou o dia 7, o próximo getCurrentCycle vai retornar currentCycle + 1
    // pois não haverá registros completed no novo ciclo ainda
    const cycleReset = day === 7;

    return NextResponse.json({ ...progress, cycleReset, currentCycle });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
