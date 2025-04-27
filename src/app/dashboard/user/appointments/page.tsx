import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/db";
import Link from "next/link";
import { Button, Row, Col, Card, Tag } from "antd";

export default async function AppointmentsPage() {
  const { userId } = await auth();
  if (!userId) return notFound();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!dbUser) return notFound();

  // 查询用户所有预约 + 用户所有 review
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
      select: { serviceId: true },
    }),
  ]);

  const reviewedServiceIds = new Set(reviews.map((r) => r.serviceId));

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <Link href="/dashboard/user">
        <Button type="default" style={{ marginBottom: 24 }}>
          ← Back to Services
        </Button>
      </Link>

      <h1 style={{ marginBottom: 24 }}>My Appointments</h1>

      <Row gutter={[24, 24]}>
        {appointments.map((appointment) => {
          const isReviewed = reviewedServiceIds.has(appointment.serviceId);

          return (
            <Col key={appointment.id} xs={24} sm={24} md={12} lg={8}>
              <Card
                title={appointment.service?.name || "Service"}
                extra={
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {appointment.isPaid ? (
                      <Tag color="green">Paid ✅</Tag>
                    ) : (
                      <Tag color="red">Unpaid</Tag>
                    )}
                    {appointment.isCompleted && (
                      <Tag color="cyan">Completed</Tag>
                    )}
                    {appointment.isCompleted && isReviewed && (
                      <Tag color="blue">Reviewed</Tag>
                    )}
                  </div>
                }
                hoverable
                style={{ height: "100%" }}
              >
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.datetime).toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong> {appointment.status}
                </p>
                <p>
                  <strong>Provider:</strong>{" "}
                  {appointment.provider?.email || "Unknown"}
                </p>

                {/* 只有已完成且未写 Review，显示 Write Review 按钮 */}
                {appointment.isCompleted && !isReviewed && (
                  <Link href={`/dashboard/user/review/${appointment.id}`}>
                    <Button type="primary" block style={{ marginTop: 16 }}>
                      Write Review
                    </Button>
                  </Link>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
