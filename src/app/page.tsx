// src/app/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const existingUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    redirect("/set-role"); // First-time user, go choose role
  }

  if (existingUser.role === "USER") {
    redirect("/dashboard/user");
  }

  if (existingUser.role === "PROVIDER") {
    redirect("/dashboard/provider");
  }

  // fallback (just in case)
  return null;
}
