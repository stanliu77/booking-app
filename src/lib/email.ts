// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentEmail({
  to,
  type,
  serviceName,
  appointmentDate,
}: {
  to: string;
  type: "new" | "accepted" | "rejected" | "refund"; // ✅ 加上 refund 类型
  serviceName: string;
  appointmentDate: string;
}) {
  let subject = "";
  let html = "";

  if (type === "new") {
    subject = "New Appointment Request";
    html = `
      <p>You have received a new appointment request!</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
    `;
  } else if (type === "accepted") {
    subject = "Appointment Confirmed";
    html = `
      <p>Good news! Your appointment has been <strong>confirmed</strong>.</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
    `;
  } else if (type === "rejected") {
    subject = "Appointment Rejected";
    html = `
      <p>Sorry, your appointment has been <strong>rejected</strong>.</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p>Please feel free to book another time.</p>
    `;
  } else if (type === "refund") {
    subject = "Refund Initiated";
    html = `
      <p>We have <strong>initiated a refund</strong> for your appointment.</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p>The refund will arrive in your account within a few business days.</p>
    `;
  }

  try {
    await resend.emails.send({
      from: "noreply@bookingsystem950.xyz", // 你的发送邮箱
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}
