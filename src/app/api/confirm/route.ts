// app/api/confirm/route.ts
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata) {
      return NextResponse.json({ error: "No metadata found on session" }, { status: 400 });
    }

    const { userId, providerId, serviceId, datetime } = session.metadata;

    // 检查是否已经存在重复预约
    const existing = await prisma.appointment.findFirst({
      where: {
        userId,
        providerId,
        serviceId,
        datetime: new Date(datetime),
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Appointment already exists" }, { status: 200 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        providerId,
        serviceId,
        datetime: new Date(datetime),
        status: "PENDING", // 初始状态为待确认
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
