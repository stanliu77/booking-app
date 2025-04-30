"use client";

import { useRouter } from "next/navigation";
import { Button, Tag } from "antd";
import Link from "next/link";

export default function AppointmentCard({ appointment }: { appointment: any }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure to delete this appointment?");
    if (!confirmed) return;

    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
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
      <p>
        👤 Provider:{" "}
        {appointment.provider.fullName || appointment.provider.email}
      </p>
      <p>Status: {formatStatus(appointment.status)}</p>
      <p>Payment: {appointment.isPaid ? "💰 Paid" : "❌ Unpaid"}</p>

      {/* ✅ 状态标签 */}
      <div style={{ marginTop: 8 }}>
        {appointment.isCompleted && <Tag color="blue">Completed</Tag>}
        {appointment.isReviewed && <Tag color="cyan">Reviewed</Tag>}
      </div>

      {/* 删除按钮 */}
      <Button danger onClick={handleDelete} style={{ marginTop: 12 }}>
        Delete
      </Button>

      {/* ✅ 如果已完成且未评价，显示评价按钮 */}
      {appointment.isCompleted && !appointment.isReviewed && (
        <Link href={`/dashboard/user/review/${appointment.id}`}>
          <Button type="primary" block style={{ marginTop: 12 }}>
            Write Review
          </Button>
        </Link>
      )}
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
