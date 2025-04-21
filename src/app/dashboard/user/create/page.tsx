// app/dashboard/user/create/page.tsx
import { prisma } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Card } from "antd";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import CreateForm from "./CreateForm";

export default async function CreatePage({ searchParams }: { searchParams: { serviceId?: string } }) {
  const { userId } = await auth();
  if (!userId) return <div>Please sign in.</div>;

  const serviceId = searchParams.serviceId;
  if (!serviceId) return notFound();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      timeSlots: true,
      provider: true, // ✅ 拿到 provider 的所有字段（包括 id）
    },
  });

  if (!service) return <div>Service not found</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Card>
        <Title level={3}>Book: {service.name}</Title>
        <Paragraph>{service.description}</Paragraph>
        <p>⏱ Duration: {service.duration} mins</p>
        <p>💰 Price: ${service.price}</p>
        <hr />

        <Title level={5}>Available Time Slots</Title>
        <CreateForm
          timeSlots={service.timeSlots}
          serviceId={service.id}
          providerId={service.provider.id}
        />

        <p style={{ fontSize: 12, color: "gray" }}>
          (Click on a time slot to proceed with booking)
        </p>
      </Card>

      <p style={{ marginTop: 16 }}>
        <Link href="/dashboard/user">← Back to Services</Link>
      </p>
    </div>
  );
}