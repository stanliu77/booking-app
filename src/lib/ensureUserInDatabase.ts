import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function ensureUserInDatabase() {
  const { userId } = await auth();
  if (!userId) return;

  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!existingUser) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId); // 从 Clerk 获取用户信息
    await db.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "unknown@example.com",
        // ⚠️ 不设置 role，等待用户手动选择
      },
    });
  }
}
