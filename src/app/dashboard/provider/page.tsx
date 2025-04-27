import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import ProviderNavbar from "@/app/componets/ProviderNavbar";
import ProviderAppointmentClient from "@/app/componets/ProviderAppointmentClient";
import { Layout } from "antd";

export default async function ProviderDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) return notFound();

  const [pending, accepted, rejected] = await Promise.all([
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "PENDING", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "asc" },
      take: 3,
    }),
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "ACCEPTED", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "desc" },
      take: 3,
    }),
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "REJECTED", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "desc" },
      take: 3,
    }),
  ]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ProviderNavbar />
      <ProviderAppointmentClient
        pending={pending.map((a) => ({
          id: a.id,
          datetime: a.datetime.toISOString(),
          isPaid: a.isPaid,
          isCompleted: a.isCompleted,
          status: a.status,
          user: {
            id: a.user.id,
            clerkId: a.user.clerkId,
            email: a.user.email,
          },
        }))}
        accepted={accepted.map((a) => ({
          id: a.id,
          datetime: a.datetime.toISOString(),
          isPaid: a.isPaid,
          isCompleted: a.isCompleted,
          status: a.status,
          user: {
            id: a.user.id,
            clerkId: a.user.clerkId,
            email: a.user.email,
          },
        }))}
        rejected={rejected.map((a) => ({
          id: a.id,
          datetime: a.datetime.toISOString(),
          isPaid: a.isPaid,
          isCompleted: a.isCompleted,
          status: a.status,
          user: {
            id: a.user.id,
            clerkId: a.user.clerkId,
            email: a.user.email,
          },
        }))}
      />
    </Layout>
  );
}
