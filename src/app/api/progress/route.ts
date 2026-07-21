import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  assertDayUnlocked,
  completeDayProgress,
  getCurrentCycle,
} from "@/lib/progress";
import { isProgramDay } from "@/lib/progress-rules";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const day = Number(body.day);

    if (!userId || !isProgramDay(day)) {
      return NextResponse.json(
        { error: "userId e um dia válido entre 1 e 7 são obrigatórios" },
        { status: 400 }
      );
    }

    const currentCycle = await getCurrentCycle(userId);

    try {
      await assertDayUnlocked(userId, day, currentCycle);
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

    const progress = await completeDayProgress(userId, day, currentCycle);

    revalidatePath("/atleta");
    revalidatePath("/dashboard");

    return NextResponse.json({
      ...progress,
      cycleReset: day === 7,
      currentCycle,
    });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
