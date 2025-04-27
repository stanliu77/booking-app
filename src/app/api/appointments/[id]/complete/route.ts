import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  const appointmentId = params.id;

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 先找到当前登录的数据库User
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 找到 appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // 确保只有该 appointment 的provider才能修改
    if (appointment.providerId !== dbUser.id) {
      return NextResponse.json({ error: "No access to this appointment" }, { status: 403 });
    }

    // 更新 isCompleted = true
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { isCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete appointment error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
