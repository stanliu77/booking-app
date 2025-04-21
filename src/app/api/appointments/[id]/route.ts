// app/api/appointments/[id]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!appointment || appointment.user.clerkId !== userId) {
      return NextResponse.json({ error: "Not found or no permission" }, { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
