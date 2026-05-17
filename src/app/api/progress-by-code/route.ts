import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Find athlete by code
    const user = await prisma.user.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Código de atleta não encontrado. Verifique e tente novamente." },
        { status: 404 }
      );
    }

    // Check if previous day is completed (day unlock logic)
    if (day > 1) {
      const prevProgress = await prisma.progress.findUnique({
        where: { userId_day: { userId: user.id, day: day - 1 } },
      });
      if (!prevProgress?.completed) {
        return NextResponse.json(
          { error: `Complete o Dia ${day - 1} antes de acessar este conteúdo.` },
          { status: 403 }
        );
      }
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: { userId_day: { userId: user.id, day } },
      update: { completed: true },
      create: { userId: user.id, day, completed: true },
    });

    return NextResponse.json({ ...progress, athleteName: user.name });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
