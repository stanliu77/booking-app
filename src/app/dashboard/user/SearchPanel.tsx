"use client";

import { Row, Col, Input, Select, Pagination } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Search } = Input;
const { Option } = Select;

interface Props {
  total: number;
  pageSize: number;
  searchParams: {
    page?: string;
    search?: string;
    sort?: string;
  };
}

export default function SearchPanel({ total, searchParams, pageSize }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  // ✅ 新增：用 state 动态控制 currentPage
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const pageParam = params.get("page");
    setCurrentPage(parseInt(pageParam || "1"));
  }, [params]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set(key, value);
    if (key !== "page") newParams.set("page", "1");
    router.push("/dashboard/user?" + newParams.toString());
  };

  return (
    <Row gutter={24} style={{ marginBottom: 24 }}>
      <Col span={12}>
        <Search
          placeholder="Search services..."
          defaultValue={params.get("search") || ""}
          onSearch={(value) => updateParam("search", value)}
          allowClear
        />
      </Col>
      <Col span={6}>
        <Select
          defaultValue={params.get("sort") || "newest"}
          style={{ width: "100%" }}
          onChange={(value) => updateParam("sort", value)}
        >
          <Option value="newest">Newest</Option>
          <Option value="priceAsc">Price Low - High</Option>
          <Option value="priceDesc">Price High - Low</Option>
        </Select>
      </Col>
      <Col span={24} style={{ marginTop: 16 }}>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={pageSize}
          onChange={(p) => updateParam("page", p.toString())}
        />
      </Col>
    </Row>
  );
}
