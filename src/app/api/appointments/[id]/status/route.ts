import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { sendAppointmentEmail } from "@/lib/email";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointmentId = params.id;
  const { status } = await req.json();

  if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!appointment || appointment.providerId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ========== 处理拒绝并退款 ==========
    if (status === "REJECTED" && appointment.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: appointment.paymentIntentId,
        });
        console.log("✅ Refund initiated for appointment:", appointmentId);

        // 退款成功后先发退款通知
        if (appointment.user?.email && appointment.service?.name) {
          await sendAppointmentEmail({
            to: appointment.user.email,
            type: "refund",
            serviceName: appointment.service.name,
            appointmentDate: appointment.datetime.toLocaleString(),
          });
        }
      } catch (refundError) {
        console.error("❌ Refund failed:", refundError);
        // 退款失败不影响后续流程
      }
    }

    // ========== 更新预约状态 ==========
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // ========== 发状态通知邮件（accepted/rejected） ==========
    if (appointment.user?.email && appointment.service?.name) {
      await sendAppointmentEmail({
        to: appointment.user.email,
        type: status === "ACCEPTED" ? "accepted" : "rejected",
        serviceName: appointment.service.name,
        appointmentDate: appointment.datetime.toLocaleString(),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
