import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle, assertDayUnlocked } from "@/lib/progress";

function formatWait(availableAt: Date | null): string {
  if (!availableAt) return "";
  const diffMs = availableAt.getTime() - Date.now();
  if (diffMs <= 0) return "";
  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

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

    // Verifica se o dia está liberado (dia anterior concluído há 24h, ou
    // 7 dias desde o fim da semana anterior, no caso do dia 1).
    try {
      await assertDayUnlocked(user.id, day, currentCycle);
    } catch (err) {
      const availableAt = (err as { availableAt?: Date | null }).availableAt ?? null;
      const wait = formatWait(availableAt);
      const message =
        day > 1
          ? `Complete o Dia ${day - 1} antes de acessar este conteúdo.`
          : "A próxima semana ainda não foi liberada.";
      return NextResponse.json(
        {
          error: wait ? `${message} Disponível em ${wait}.` : message,
          locked: true,
          availableAt: availableAt ? availableAt.toISOString() : null,
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const progress = await prisma.progress.upsert({
      where: { userId_day_cycle: { userId: user.id, day, cycle: currentCycle } },
      update: { completed: true, completedAt: now },
      create: { userId: user.id, day, cycle: currentCycle, completed: true, completedAt: now },
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
