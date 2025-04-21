// src/app/api/services/route.ts
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
      where: {
        providerId: currentUser.id,
      },
      include: {
        timeSlots: true,
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find current user in database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "PROVIDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, duration, imageUrl, timeSlots } = body;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0]?.url : imageUrl;
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
        imageUrl :imageUrlString,
        providerId: currentUser.id,
        timeSlots: {
          create: timeSlots.map((slot: any) => ({
            start: new Date(slot.start),
            end: new Date(slot.end),
          })),
        },
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
