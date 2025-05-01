export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import Link from "next/link";
import { Button, Row, Col } from "antd";
import AppointmentCard from "./AppointmentCard";

export default async function AppointmentsPage() {
  const { userId } = await auth();
  if (!userId) return notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!dbUser) return notFound();

  const [appointments, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: { userId: dbUser.id },
      include: {
        provider: true,
        service: true,
      },
      orderBy: { datetime: "desc" },
    }),
    prisma.review.findMany({
      where: { userId: dbUser.id },
      select: { serviceId: true }, // ✅ 改回使用 serviceId
    }),
  ]);

  const reviewedServiceIds = new Set(reviews.map((r) => r.serviceId)); // ✅ 用服务级别判断

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <Link href="/dashboard/user">
        <Button type="default" style={{ marginBottom: 24 }}>
          ← Back to Services
        </Button>
      </Link>

      <h1 style={{ marginBottom: 24 }}>My Appointments</h1>

      <Row gutter={[24, 24]}>
        {appointments.map((appointment) => (
          <Col key={appointment.id} xs={24} sm={24} md={12} lg={8}>
            <AppointmentCard
              appointment={{
                ...appointment,
                isCompleted: appointment.isCompleted,
                isReviewed: reviewedServiceIds.has(appointment.serviceId), // ✅ 改回服务级别判断
              }}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
