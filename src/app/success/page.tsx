import { prisma } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { sendAppointmentEmail } from "@/lib/email";
import SuccessPageClient from "./SuccessPageClient";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return <div>Invalid session. No session_id found.</div>;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const appointmentId = session.metadata?.appointmentId;

  if (!appointmentId) {
    return <div>Invalid metadata. No appointmentId found.</div>;
  }

  // ✅ 获取当前身份
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId || "" } });

  if (!userId || !dbUser) {
    console.warn("⚠️ Invalid identity. Only users can access this page.");
    return <div>Unauthorized access. You must be a user to view this page.</div>;
  }

  // ✅ 安全更新并发送邮件
  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { isPaid: true },
      include: {
        user: true,
        service: {
          include: {
            provider: true,
          },
        },
      },
    });

    const providerEmail = updatedAppointment.service?.provider?.email;
    const serviceName = updatedAppointment.service?.name;

    if (providerEmail && serviceName) {
      console.log("📧 Sending email to provider:", providerEmail);
      await sendAppointmentEmail({
        to: providerEmail,
        type: "new",
        serviceName,
        appointmentDate: updatedAppointment.datetime.toISOString(),
      });
    }
  } catch (err) {
    console.error("❌ Failed to process payment success logic:", err);
    return <div>Payment succeeded, but we couldn't finalize the booking. Please contact support.</div>;
  }

  // ✅ 渲染成功页面（客户端处理跳转）
  return <SuccessPageClient />;
}
