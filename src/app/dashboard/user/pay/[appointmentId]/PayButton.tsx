"use client";

import { Button, message } from "antd";

export default function PayButton({
  appointment,
  userId,
}: {
  appointment: any;
  userId: string;
}) {
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
          userId, // ✅ 直接传 userId
          providerId: appointment.providerId,
          serviceId: appointment.serviceId,
          datetime: appointment.datetime,
          appointmentId: appointment.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Failed to create checkout session");
        return;
      }

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
