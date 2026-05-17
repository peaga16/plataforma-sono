import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { progresses: true },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(users);
}
