// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId) return NextResponse.next();

  const url = req.nextUrl;

  // 跳过 /set-role，防止死循环
  if (url.pathname === "/set-role") return NextResponse.next();

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|favicon.ico).*)", // 匹配除静态资源以外的所有路径
    "/", // 匹配根路径
  ],
};
