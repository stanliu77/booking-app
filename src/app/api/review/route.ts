// app/api/reviews/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const { appointmentId, rating, comment } = body;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!appointmentId || !rating || !comment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment || !appointment.isCompleted) {
      return NextResponse.json({ error: "Appointment not found or not completed" }, { status: 400 });
    }

    // 防止重复评论（同一用户对同一服务只能评价一次）
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        serviceId: appointment.serviceId!,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this service" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        serviceId: appointment.serviceId!,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
