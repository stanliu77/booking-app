import { prisma } from "@/app/lib/db";
import Stripe from "stripe";
import { sendAppointmentEmail } from "@/lib/email";

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

  // ✅ 获取 Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // ✅ 从 metadata 读取 appointmentId
  const appointmentId = session.metadata?.appointmentId;

  if (!appointmentId) {
    return <div>Invalid metadata. No appointmentId found.</div>;
  }

  // ✅ 更新数据库为已支付，并获取相关信息（包括 provider 邮箱）
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

  // ✅ 发送邮件给商家（服务提供者）
  const providerEmail = updatedAppointment.service?.provider?.email;
  const serviceName = updatedAppointment.service?.name;

  if (providerEmail && serviceName) {
    await sendAppointmentEmail({
      to: providerEmail,
      type: "new",
      serviceName,
      appointmentDate: updatedAppointment.datetime.toLocaleString(),
    });
  }

  // ✅ 成功页面展示并跳转用户自己的预约页面
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="text-5xl text-green-500">✅</div>
      <h2 className="text-2xl font-semibold">Payment Successful!</h2>
      <p className="text-gray-600">Your appointment has been confirmed.</p>
      <a
        href="/dashboard/user/appointments"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        View Your Appointments
      </a>
    </div>
  );
}
