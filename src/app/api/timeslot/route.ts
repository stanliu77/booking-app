// app/api/timeslots/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { serviceId, start, end } = body;

  if (!serviceId || !start || !end) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  try {
    // 验证当前用户是否是该服务的商家
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.providerId !== userId) {
      return new NextResponse("Unauthorized to modify this service", { status: 403 });
    }

    // 创建时间段
    const timeslot = await prisma.timeSlot.create({
      data: {
        serviceId,
        start: new Date(start),
        end: new Date(end),
      },
    });

    return NextResponse.json(timeslot);
  } catch (error) {
    console.error("TimeSlot create error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
