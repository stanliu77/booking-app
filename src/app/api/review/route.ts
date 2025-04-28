import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const { appointmentId, rating, comment } = body;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();  // 先拿 client
    const user = await client.users.getUser(userId);  // 再拿 user
    const email = user.emailAddresses[0]?.emailAddress || ""; // 再拿 email


    if (!appointmentId || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment || !appointment.isCompleted) {
      return NextResponse.json({ error: "Appointment not found or not completed" }, { status: 400 });
    }

    const existing = await prisma.review.findFirst({
      where: {
        userId: dbUser.id,
        serviceId: appointment.serviceId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this service" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: dbUser.id,
        serviceId: appointment.serviceId,
        rating,
        comment,
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { serviceId: appointment.serviceId },
      _avg: { rating: true },
    });

    const averageRating = aggregate._avg.rating || 0;

    await prisma.service.update({
      where: { id: appointment.serviceId },
      data: { rating: averageRating },
    });

    return NextResponse.json(review);
  } catch (err: any) {
    console.error("Review error:", err?.message || err);
    console.error("Review full error object:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
