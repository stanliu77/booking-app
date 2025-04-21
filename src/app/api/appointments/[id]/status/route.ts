// app/api/appointments/[id]/status/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointmentId = params.id;
  const { status } = await req.json();

  if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.providerId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
