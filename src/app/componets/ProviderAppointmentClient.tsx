'use client';

import { useState } from "react";
import { Button, Card, Col, Layout, Row, Typography, Tag, message } from "antd";
const { Title } = Typography;

interface Appointment {
  id: string;
  datetime: string;
  isPaid: boolean;
  isCompleted: boolean;
  status: "PENDING" | "ACCEPTED" | "REJECTED"; // ✅ 新增 status 方便判断
  user: {
    id: string;
    clerkId: string;
    email: string;
  };
}

interface Props {
  pending: Appointment[];
  accepted: Appointment[];
  rejected: Appointment[];
}

export default function ProviderAppointmentClient({ pending, accepted, rejected }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);

  async function updateStatus(id: string, status: "ACCEPTED" | "REJECTED") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }
  
      message.success(`Appointment ${status.toLowerCase()} successfully`);
      window.location.reload();
    } catch (error: any) {
      console.error("Update status error:", error);
      message.error(error.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  }

  async function markCompleted(id: string) {
    setCompletedId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/complete`, {
        method: "PATCH",
      });
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as completed");
      }
  
      message.success("Appointment marked as completed!");
      window.location.reload();
    } catch (error: any) {
      console.error("Mark completed error:", error);
      message.error(error.message || "Failed to complete appointment");
    } finally {
      setCompletedId(null);
    }
  }

  const renderCard = (appt: Appointment) => (
    <Card
      key={appt.id}
      style={{ marginBottom: 16 }}
      extra={
        <>
          {appt.isPaid ? (
            <Tag color="green">Paid ✅</Tag>
          ) : (
            <Tag color="red">Unpaid</Tag>
          )}
          {appt.isCompleted && (
            <Tag color="blue" style={{ marginLeft: 8 }}>Completed</Tag>
          )}
        </>
      }
    >
      <p><strong>From:</strong> {appt.user.email}</p>
      <p><strong>Date:</strong> {new Date(appt.datetime).toLocaleString()}</p>

      {/* 按钮区域 */}
      {!appt.isCompleted && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {appt.status === "PENDING" && (
            <>
              <Button
                type="primary"
                onClick={() => updateStatus(appt.id, "ACCEPTED")}
                loading={loadingId === appt.id}
              >
                Accept
              </Button>
              <Button
                danger
                onClick={() => updateStatus(appt.id, "REJECTED")}
                loading={loadingId === appt.id}
              >
                Reject
              </Button>
            </>
          )}

          {appt.status === "ACCEPTED" && (
            <Button
              style={{ backgroundColor: "#52c41a", color: "white" }}
              onClick={() => markCompleted(appt.id)}
              loading={completedId === appt.id}
            >
              Mark Completed
            </Button>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <Layout style={{ padding: "24px", marginTop: 64 }}>
      <Title level={3}>Incoming Appointments</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8}>
          <Title level={5}>Pending</Title>
          {pending.length === 0 ? <p>No pending.</p> : pending.map((a) => renderCard(a))}
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Title level={5}>Accepted</Title>
          {accepted.length === 0 ? <p>No accepted.</p> : accepted.map((a) => renderCard(a))}
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Title level={5}>Rejected</Title>
          {rejected.length === 0 ? <p>No rejected.</p> : rejected.map((a) => renderCard(a))}
        </Col>
      </Row>
    </Layout>
  );
}
