// src/components/ProviderNavbar.tsx
"use client";

import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const ProviderNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: "/dashboard/provider",
      icon: <CalendarOutlined />,
      label: "Appointments",
    },
    {
      key: "/dashboard/provider/services",
      icon: <AppstoreOutlined />,
      label: "My Services",
    },
    {
      key: "/dashboard/provider/services/create",
      icon: <PlusOutlined />,
      label: "Create Service",
    },
  ];

  const handleClick = (e: any) => {
    router.push(e.key);
  };

  return (
    <Header style={{ background: "#fff", padding: 0 }}>
      <Menu
        mode="horizontal"
        selectedKeys={[pathname]}
        onClick={handleClick}
        items={items}
      />
    </Header>
  );
};

export default ProviderNavbar;