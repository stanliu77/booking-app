"use client";

import { useState, useTransition } from "react";
import { Button, message } from "antd";
import { useRouter } from "next/navigation";

interface TimeSlot {
  id: string;
  start: Date;
}

interface CreateFormProps {
  timeSlots: TimeSlot[];
  serviceId: string;
  providerId: string;
}

export default function CreateForm({ timeSlots, serviceId, providerId }: CreateFormProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // ✅ 必须放在函数组件内部

  const handleSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
  };

  const handleSubmit = () => {
    if (!selectedSlotId) return;

    const selectedSlot = timeSlots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot) return;
    console.log("🧪 selectedSlot.start 类型是：", typeof selectedSlot.start, selectedSlot.start);
    console.log("converted:", selectedSlot.start.toISOString());

    startTransition(async () => {
      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId,
            serviceId,
            datetime: selectedSlot.start.toISOString(),
          }),
        });

        const data = await res.json();
        console.log("Appointment API response:", data);

        if (!res.ok) {
          message.error(`Failed to create appointment: ${data.error}`);
        } else {
          // ✅ 成功后跳转到支付页
          console.log("🔁 redirecting to: ", `/dashboard/user/pay/${data.id}`);
          router.push(`/dashboard/user/pay/${data.id}`);
        }
      } catch (err) {
        console.error("Error creating appointment:", err);
        message.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            type={slot.id === selectedSlotId ? "primary" : "default"}
            size="small"
            onClick={() => handleSelect(slot.id)}
          >
            {new Date(slot.start).toLocaleString()}
          </Button>
        ))}
      </div>

      <Button
        type="primary"
        onClick={handleSubmit}
        disabled={!selectedSlotId || isPending}
        loading={isPending}
      >
        Proceed to Book & Pay
      </Button>
    </>
  );
}
