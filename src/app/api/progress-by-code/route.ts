import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/progress";
import { isDayUnlocked, PROGRAM_DAYS } from "@/lib/progress-rules";

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
    const completedRecords = await prisma.progress.findMany({
      where: { userId: user.id, cycle: currentCycle, completed: true },
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
      where: { userId_day_cycle: { userId: user.id, day, cycle: currentCycle } },
      update: { completed: true },
      create: { userId: user.id, day, cycle: currentCycle, completed: true },
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
