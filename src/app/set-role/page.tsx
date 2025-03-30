"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Space, Typography, message } from "antd";
import { UserOutlined, ShopOutlined } from "@ant-design/icons";

export default function SetRolePage() {
  const router = useRouter();

  // Check if user already has a role — prevent going back here after role is set
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/get-role");
        const data = await res.json();
        if (data.role === "USER") {
          router.replace("/dashboard/user");
        } else if (data.role === "PROVIDER") {
          router.replace("/dashboard/provider");
        }
      } catch (err) {
        console.error("Role check failed", err);
        message.error("Failed to verify role");
      }
    };

    checkRole();
  }, [router]);

  const handleSelectRole = async (role: "USER" | "PROVIDER") => {
    const res = await fetch("/api/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      message.success("Role selected successfully!");
      router.push(role === "USER" ? "/dashboard/user" : "/dashboard/provider");
    } else {
      const data = await res.json();
      message.error(data.error || "Failed to set role");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Space size={40} direction="horizontal">
        <Card
          hoverable
          style={{ width: 300, textAlign: "center" }}
          onClick={() => handleSelectRole("USER")}
        >
          <UserOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <Typography.Title level={3}>Continue as User</Typography.Title>
        </Card>

        <Card
          hoverable
          style={{ width: 300, textAlign: "center" }}
          onClick={() => handleSelectRole("PROVIDER")}
        >
          <ShopOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <Typography.Title level={3}>Continue as Provider</Typography.Title>
        </Card>
      </Space>
    </div>
  );
}
