// src/app/api/services/provider/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "PROVIDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      where: { providerId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error("Failed to load provider services:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
