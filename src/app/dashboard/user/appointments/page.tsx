import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import AppointmentCard from "./AppointmentCard";
import Link from "next/link";
import { Button } from "antd";

export default async function AppointmentsPage() {
  const { userId } = await auth();
  if (!userId) return notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!dbUser) return notFound();

  const appointments = await prisma.appointment.findMany({
    where: { userId: dbUser.id },
    include: {
      provider: true,
      service: true,
    },
    orderBy: { datetime: "desc" },
  });

  return (
    <div style={{ padding: 32 }}>
      <Link href="/dashboard/user">
        <Button type="default" style={{ marginBottom: 16 }}>
          ← Back to Services
        </Button>
      </Link>
      <h1>My Appointments</h1>
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
