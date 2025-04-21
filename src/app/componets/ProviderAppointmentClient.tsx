'use client';

import { Button, Card, Col, Layout, Row, Typography } from "antd";
const { Title } = Typography;

interface Appointment {
  id: string;
  datetime: string;
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
  async function updateStatus(id: string, status: "ACCEPTED" | "REJECTED") {
    await fetch(`/api/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    window.location.reload();
  }

  const renderCard = (appt: Appointment, allowAction = false) => (
    <Card key={appt.id} style={{ marginBottom: 16 }}>
      <p><strong>From:</strong> {appt.user.email}</p>
      <p><strong>Date:</strong> {new Date(appt.datetime).toLocaleString()}</p>
      {allowAction && (
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="primary" onClick={() => updateStatus(appt.id, "ACCEPTED")}>Accept</Button>
          <Button danger onClick={() => updateStatus(appt.id, "REJECTED")}>Reject</Button>
        </div>
      )}
    </Card>
  );

  return (
    <Layout style={{ padding: "24px", marginTop: 64 }}>
      <Title level={3}>Incoming Appointments</Title>
      <Row gutter={24}>
        <Col span={8}>
          <Title level={5}>Pending</Title>
          {pending.length === 0 ? <p>No pending.</p> : pending.map((a) => renderCard(a, true))}
        </Col>
        <Col span={8}>
          <Title level={5}>Accepted</Title>
          {accepted.length === 0 ? <p>No accepted.</p> : accepted.map((a) => renderCard(a))}
        </Col>
        <Col span={8}>
          <Title level={5}>Rejected</Title>
          {rejected.length === 0 ? <p>No rejected.</p> : rejected.map((a) => renderCard(a))}
        </Col>
      </Row>
    </Layout>
  );
}
