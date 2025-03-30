'use server'

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client"; 

export async function POST() {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (existingUser) {
    return NextResponse.json({ message: "User already exists" });
  }

  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      role: Role.USER, // 
    },
  });

  return NextResponse.json(newUser);
}
