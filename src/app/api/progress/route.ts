import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Upsert: cria ou atualiza o progresso do dia
    const progress = await prisma.progress.upsert({
      where: {
        userId_day: { userId, day },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        day,
        completed: true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
