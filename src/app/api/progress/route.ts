import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/progress";
import { isDayUnlocked, PROGRAM_DAYS } from "@/lib/progress-rules";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    const day = Number(body.day);

    if (!userId || !Number.isInteger(day) || !PROGRAM_DAYS.includes(day as (typeof PROGRAM_DAYS)[number])) {
      return NextResponse.json(
        { error: "userId e um dia válido entre 1 e 7 são obrigatórios" },
        { status: 400 }
      );
    }

    const currentCycle = await getCurrentCycle(userId);
    const completedRecords = await prisma.progress.findMany({
      where: { userId, cycle: currentCycle, completed: true },
      select: { day: true },
    });
    const completedDays = completedRecords.map((record) => record.day);

    if (!isDayUnlocked(day, completedDays)) {
      return NextResponse.json(
        { error: "Conclua todos os dias anteriores deste ciclo antes de continuar." },
        { status: 403 }
      );
    }

    const progress = await prisma.progress.upsert({
      where: { userId_day_cycle: { userId, day, cycle: currentCycle } },
      update: { completed: true },
      create: { userId, day, cycle: currentCycle, completed: true },
    });

    // Garante que a tela do atleta não reutilize os cards do ciclo anterior.
    revalidatePath("/atleta");
    revalidatePath("/dashboard");

    const cycleReset = day === 7;

    return NextResponse.json({ ...progress, cycleReset, currentCycle });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
