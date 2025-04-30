import { prisma } from "@/app/lib/db";
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
    await sendAppointmentEmail({
      to: providerEmail,
      type: "new",
      serviceName,
      appointmentDate: updatedAppointment.datetime.toISOString(), // ✅ 更稳定
    });
  }

  // ✅ 渲染成功页面（客户端处理跳转）
  return <SuccessPageClient />;
}
