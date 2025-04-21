// src/middleware.ts
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();

  if (!userId) return NextResponse.next();

  const url = req.nextUrl;

  // 不拦截 /set-role 页面本身，避免死循环
  if (url.pathname === "/set-role") return NextResponse.next();

  // 查询用户
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // 如果没有设置角色，跳转去设置
  if (existingUser && !existingUser.role) {
    const newUrl = req.nextUrl.clone();
    newUrl.pathname = "/set-role";
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // 跳过 Next.js 内部文件和静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 保持对 API 的保护
    '/(api|trpc)(.*)',
  ],
};
