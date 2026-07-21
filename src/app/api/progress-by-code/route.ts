import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  assertDayUnlocked,
  completeDayProgress,
  getCurrentCycle,
} from "@/lib/progress";
import { isProgramDay } from "@/lib/progress-rules";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const day = Number(body.day);

    if (!code || !isProgramDay(day)) {
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

    try {
      await assertDayUnlocked(user.id, day, currentCycle);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "DAY_LOCKED") {
        throw error;
      }

      const availableAt = (error as Error & { availableAt?: Date | null }).availableAt;

      return NextResponse.json(
        {
          error: "Este dia ainda não foi liberado.",
          locked: true,
          availableAt: availableAt ? availableAt.toISOString() : null,
        },
        { status: 403 }
      );
    }

    const progress = await completeDayProgress(user.id, day, currentCycle);

    revalidatePath("/atleta");
    revalidatePath("/dashboard");

    return NextResponse.json({
      ...progress,
      athleteName: user.name,
      cycleReset: day === 7,
      currentCycle,
    });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
