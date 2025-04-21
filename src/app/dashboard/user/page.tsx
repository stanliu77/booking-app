// app/dashboard/user/page.tsx
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { Layout, Row, Col, Card, Button } from "antd";
import Link from "next/link";
import SearchPanel from "./SearchPanel"; // ✅ 默认导入
import { Prisma } from "@prisma/client";
import Title from "antd/es/typography/Title";

interface SearchParams {
  searchParams: {
    page?: string;
    search?: string;
    sort?: string;
  };
}

export default async function UserDashboard({ searchParams }: SearchParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return <div>Please sign in.</div>;
  const { users } = await clerkClient();
  const user = await users.getUser(userId);
  const name = user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress || "User";

  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const sort = searchParams.sort || "newest";
  const pageSize = 6;
  const skip = (page - 1) * pageSize;

  const orderBy: Prisma.ServiceOrderByWithRelationInput =
    sort === "priceAsc"
      ? { price: "asc" }
      : sort === "priceDesc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      orderBy: orderBy, // ✅ 使用已定义的变量
      skip,
      take: pageSize,
    }),
    prisma.service.count({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
    }),
  ]);
  console.log(Title)
  return (
    <Layout style={{ padding: 24, minHeight: "100vh" }}>
      <Title level={3}>Welcome, {name} 👋</Title>

      <SearchPanel total={total} searchParams={searchParams} pageSize={pageSize} />

      <Row gutter={24}>
        {/* 左边：服务卡片 */}
        <Col span={18}>
          <Row gutter={[16, 16]}>
            {services.map((s) => (
              <Col span={12} key={s.id}>
                <Card
                  cover={
                    s.imageUrl ? (
                      <img
                        alt={s.name}
                        src={s.imageUrl}
                        style={{
                          width: "100%",
                          height: "auto", // 高度自动适应宽度
                          aspectRatio: "4 / 3", // 保持宽高比
                          objectFit: "cover", // 裁剪填满
                          borderRadius: "8px",
                        }}
                      />
                    ) : null
                  }
                  title={s.name}
                  extra={<span>${s.price}</span>}
                  hoverable
                >
                  <p>{s.description}</p>
                  <p>⏱ {s.duration} mins</p>
                  <Button type="link">
                    <Link href={`/dashboard/user/create?serviceId=${s.id}`}>Book Now</Link>
                  </Button>
                </Card>

              </Col>
            ))}
          </Row>
        </Col>

        {/* 右边：用户菜单 */}
        <Col span={6}>
          <Card title="📂 My Menu">
            <p><Link href="/dashboard/user/appointments">📅 My Appointments</Link></p>
            <p><Link href="/dashboard/user/reviews">✍️ Reviews To Write</Link></p>
            <p><Link href="/dashboard/user/create">➕ Create New Appointment</Link></p>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
