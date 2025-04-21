// src/app/api/providers/[id]/services/route.ts
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const providerId = params.id;

  try {
    const services = await prisma.service.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error loading services:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
