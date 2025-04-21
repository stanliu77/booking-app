// app/api/services/[id]/timeslots/route.ts
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const serviceId = params.id;

  if (!serviceId) {
    return new NextResponse("Service ID is required", { status: 400 });
  }

  try {
    const timeSlots = await prisma.timeSlot.findMany({
      where: { serviceId },
      orderBy: { start: "asc" },
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error("Fetch timeslots error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
