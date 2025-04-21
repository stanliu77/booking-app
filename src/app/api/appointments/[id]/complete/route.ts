import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const appointmentId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.providerId !== userId) {
      return NextResponse.json({ error: "No access to this appointment" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { isCompleted: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Complete appointment error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
