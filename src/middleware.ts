// src/middleware.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function middleware(req: NextRequest) {
  const { userId } = getAuth(req);  // ✅ Next.js 15 使用 getAuth(req)

  if (!userId) return NextResponse.next();

  const url = req.nextUrl;

  // 不拦截 /set-role 页面本身，避免死循环
  if (url.pathname === "/set-role") return NextResponse.next();

  // 查询数据库中是否已设置角色
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existingUser && !existingUser.role) {
    const newUrl = req.nextUrl.clone();
    newUrl.pathname = "/set-role";
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 跳过 Next.js 内部文件和静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 保持对 API 的保护
    '/(api|trpc)(.*)',
  ],
};
