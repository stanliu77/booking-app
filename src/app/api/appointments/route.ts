import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { sendAppointmentEmail } from "@/lib/email"; // ✅ 加这一行

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth(); // Clerk 的 ID

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { providerId, serviceId, datetime } = body;

    if (!providerId || !serviceId || !datetime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (providerId === clerkUserId) {
      return NextResponse.json({ error: "Cannot book yourself" }, { status: 400 });
    }

    // ✅ 正确查询数据库中 clerkId 对应的 user.id
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: dbUser.id, // ✅ 不是 Clerk ID，是数据库 ID
        providerId,
        serviceId,
        datetime: new Date(datetime),
      },
    });

    // ✅ 新增：创建预约成功后，给商家发邮件通知
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (provider?.email && service?.name) {
      await sendAppointmentEmail({
        to: provider.email,
        type: "new",
        serviceName: service.name,
        appointmentDate: new Date(datetime).toLocaleString(),
      });
    }

    return NextResponse.json({ id: appointment.id }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
