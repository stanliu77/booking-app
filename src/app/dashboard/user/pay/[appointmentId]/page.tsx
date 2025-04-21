// app/dashboard/user/pay/[appointmentId]/page.tsx

import { prisma } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Card } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import PayButton from './PayButton' // 引入按钮组件

type PageProps = {
  params: {
    appointmentId: string;
  };
};

export default async function PayPage(props: PageProps) {
  const appointmentId = props.params.appointmentId;

  const { userId: clerkId } = await auth();
  if (!clerkId) return <div>Please sign in.</div>;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) return <div>User not found.</div>;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: true,
      user: true,
    },
  });

  if (!appointment || appointment.user.id !== dbUser.id || !appointment.service) return notFound();

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Card>
        <Title level={3}>Confirm Payment</Title>
        <Paragraph>
          You're about to pay for <b>{appointment.service.name}</b>
        </Paragraph>
        <Paragraph>💰 Amount: ${appointment.service.price}</Paragraph>
        <PayButton appointment={appointment} userId={dbUser.id} />
      </Card>
    </div>
  );
}
