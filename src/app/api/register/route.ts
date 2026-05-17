import { prisma } from "@/lib/prisma";
const bcrypt = require("bcrypt");
import { NextResponse } from "next/server";

// Rota de registro individual (mantida para compatibilidade)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
