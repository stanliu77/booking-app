import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import ProviderNavbar from "@/app/componets/ProviderNavbar";
import ProviderAppointmentClient from "@/app/componets/ProviderAppointmentClient";
import { Layout } from "antd";

// ✅ 明确类型定义（datetime 是 string）
interface Appointment {
  id: string;
  datetime: string;
  isPaid: boolean;
  isCompleted: boolean;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user: {
    id: string;
    clerkId: string;
    email: string;
  };
}

export default async function ProviderDashboard({
  searchParams,
}: {
  searchParams?: {
    pendingPage?: string;
    acceptedPage?: string;
    rejectedPage?: string;
  };
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) return notFound();

  const take = 3;
  const pendingPage = parseInt(searchParams?.pendingPage || "1");
  const acceptedPage = parseInt(searchParams?.acceptedPage || "1");
  const rejectedPage = parseInt(searchParams?.rejectedPage || "1");

  const [pending, accepted, rejected, totalPending, totalAccepted, totalRejected] = await Promise.all([
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "PENDING", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "asc" },
      take,
      skip: (pendingPage - 1) * take,
    }),
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "ACCEPTED", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "desc" },
      take,
      skip: (acceptedPage - 1) * take,
    }),
    prisma.appointment.findMany({
      where: { providerId: dbUser.id, status: "REJECTED", isPaid: true },
      include: { user: true },
      orderBy: { datetime: "desc" },
      take,
      skip: (rejectedPage - 1) * take,
    }),
    prisma.appointment.count({
      where: { providerId: dbUser.id, status: "PENDING", isPaid: true },
    }),
    prisma.appointment.count({
      where: { providerId: dbUser.id, status: "ACCEPTED", isPaid: true },
    }),
    prisma.appointment.count({
      where: { providerId: dbUser.id, status: "REJECTED", isPaid: true },
    }),
  ]);

  // ✅ 强转 datetime 为 string，匹配前端类型
  const pendingTyped: Appointment[] = pending.map((a) => ({
    ...a,
    datetime: a.datetime.toISOString(),
  }));
  const acceptedTyped: Appointment[] = accepted.map((a) => ({
    ...a,
    datetime: a.datetime.toISOString(),
  }));
  const rejectedTyped: Appointment[] = rejected.map((a) => ({
    ...a,
    datetime: a.datetime.toISOString(),
  }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ProviderNavbar />
      <ProviderAppointmentClient
        pending={pendingTyped}
        accepted={acceptedTyped}
        rejected={rejectedTyped}
        pendingPage={pendingPage}
        acceptedPage={acceptedPage}
        rejectedPage={rejectedPage}
        totalPendingPages={Math.ceil(totalPending / take)}
        totalAcceptedPages={Math.ceil(totalAccepted / take)}
        totalRejectedPages={Math.ceil(totalRejected / take)}
      />
    </Layout>
  );
}
