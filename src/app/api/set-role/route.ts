import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth(); // Clerk 的 userId，其实就是你保存到 clerkId 的值

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  const user = await db.user.findUnique({
    where: { clerkId: userId }, // ✅ 用 clerkId 不是 id！
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
