"use client";

import { Button, message } from "antd";

export default function PayButton({ appointment }: { appointment: any }) {
  const handlePay = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName: appointment.service.name,
          amount: appointment.service.price,
          userId: appointment.userId,
          providerId: appointment.providerId,
          serviceId: appointment.serviceId,
          datetime: appointment.datetime,
          appointmentId: appointment.id, // ✅ 一定要传 appointmentId！
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Failed to create checkout session");
        return;
      }

      // ✅ 跳转至 Stripe 支付页
      window.location.href = data.url;
    } catch (error) {
      console.error("💥 Payment error:", error);
      message.error("Something went wrong during payment");
    }
  };

  return (
    <Button type="primary" onClick={handlePay}>
      Pay Now
    </Button>
  );
}
