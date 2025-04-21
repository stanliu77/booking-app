import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

// ✅ 获取服务详情
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: { timeSlots: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// ✅ 更新服务
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🛠 映射成数据库中的用户
  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { name, description, price, duration, imageUrl, timeSlots } = body;

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    // ✅ 检查当前用户是否为该服务的商家
    if (!existing || existing.providerId !== currentUser.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price,
        duration,
        imageUrl,
        timeSlots: {
          deleteMany: {}, // 删除旧的所有时间段
          create: timeSlots.map((slot: any) => ({
            start: new Date(slot.start),
            end: new Date(slot.end),
          })),
        },
      },
      include: { timeSlots: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// ✅ 删除服务
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service || service.providerId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 如果有外键约束，需要先删除相关的时间段
    await prisma.timeSlot.deleteMany({
      where: { serviceId: params.id },
    });

    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("❌ DELETE failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

