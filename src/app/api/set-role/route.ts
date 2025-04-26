import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // ✅ 分两步调用 Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "No valid email found" }, { status: 400 });
    }

    user = await db.user.create({
      data: {
        clerkId: userId,
        email,
        role,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      role: user.role,
    });
  }

  const updatedUser = await db.user.update({
    where: { clerkId: userId },
    data: { role },
  });

  return NextResponse.json({
    message: "Role updated successfully",
    role: updatedUser.role,
  });
}
