// src/app/api/set-role/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const user = await currentUser(); // 
  const body = await req.json();
  const { role } = body;

  if (!user || !user.id || !["USER", "PROVIDER"].includes(role)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const existing = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Already set" }, { status: 400 });
  }

  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress, // 
      role: role as Role,
    },
  });

  return NextResponse.json({ success: true, user: newUser });
}
