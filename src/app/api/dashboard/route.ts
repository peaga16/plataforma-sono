import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      progresses: {
        orderBy: [{ cycle: "asc" }, { day: "asc" }],
      },
    },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(users);
}
