"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";

export default function AppointmentCard({ appointment }: { appointment: any }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure to delete this appointment?");
    if (!confirmed) return;

    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh(); // ✅ Next.js 15 刷新数据
    } else {
      alert("Failed to delete appointment.");
    }
  };

  if (!appointment.service || !appointment.provider) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
      }}
    >
      <h3>{appointment.service.name}</h3>
      <p>📅 {new Date(appointment.datetime).toLocaleString()}</p>
      <p>💲 ${appointment.service.price}</p>
      <p>👤 Provider: {appointment.provider.email}</p>
      <p>Status: {formatStatus(appointment.status)}</p>
      <p>Payment: {appointment.isPaid ? "💰 Paid" : "❌ Unpaid"}</p>

      <Button danger onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "🕒 Pending";
    case "ACCEPTED":
      return "✅ Accepted";
    case "REJECTED":
      return "❌ Rejected";
    default:
      return status;
  }
}
