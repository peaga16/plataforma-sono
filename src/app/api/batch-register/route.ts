import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Gera código único tipo ATL001, ATL002...
function generateCode(index: number): string {
  return `ATL${String(index).padStart(3, "0")}`;
}

// POST /api/batch-register
// Body: { athletes: [{ name: string }] }
// Cria múltiplos atletas de uma vez com códigos sequenciais
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const athletes: { name: string }[] = body.athletes;

    if (!athletes || !Array.isArray(athletes) || athletes.length === 0) {
      return NextResponse.json(
        { error: "Envie um array 'athletes' com pelo menos um atleta." },
        { status: 400 }
      );
    }

    // Busca o maior índice de código já existente para continuar a sequência
    const existingUsers = await prisma.user.findMany({
      where: { code: { startsWith: "ATL" } },
      select: { code: true },
    });

    const maxIndex = existingUsers.reduce((max, u) => {
      const num = parseInt(u.code?.replace("ATL", "") || "0");
      return num > max ? num : max;
    }, 0);

    const created = [];

    for (let i = 0; i < athletes.length; i++) {
      const name = athletes[i].name?.trim();
      if (!name) continue;

      const codeIndex = maxIndex + i + 1;
      const code = generateCode(codeIndex);

      // Email sintético — não é usado para login, só para unicidade no banco
      const email = `${code.toLowerCase()}@atleta.sono`;

      const user = await prisma.user.create({
        data: {
          name,
          email,
          code,
          password: null, // atletas não usam senha
        },
      });

      created.push({ id: user.id, name: user.name, code: user.code });
    }

    return NextResponse.json({ created });
  } catch (error) {
    console.error("Erro no cadastro em lote:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// GET /api/batch-register — lista todos os atletas com seus códigos
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { code: { startsWith: "ATL" } },
      select: { id: true, name: true, code: true },
      orderBy: { code: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao listar atletas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
