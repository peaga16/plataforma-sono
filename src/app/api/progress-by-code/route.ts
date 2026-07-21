import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/progress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const day = Number(body.day);

    if (!code || !Number.isInteger(day) || !PROGRAM_DAYS.includes(day as (typeof PROGRAM_DAYS)[number])) {
      return NextResponse.json(
        { error: "Código e um dia válido entre 1 e 7 são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { code },
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

    const now = new Date();
    const progress = await prisma.progress.upsert({
      where: { userId_day_cycle: { userId: user.id, day, cycle: currentCycle } },
      update: { completed: true, completedAt: now },
      create: { userId: user.id, day, cycle: currentCycle, completed: true, completedAt: now },
    });

    revalidatePath("/atleta");
    revalidatePath("/dashboard");

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
