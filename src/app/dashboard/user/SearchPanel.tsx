"use client";

import { Row, Col, Input, Select, Pagination } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

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
  const params = new URLSearchParams(searchParams as any);
  const currentPage = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "newest";

  const updateParam = (key: string, value: string) => {
    params.set(key, value);
    if (key !== "page") params.set("page", "1");
    router.push("/dashboard/user?" + params.toString());
  };

  return (
    <Row gutter={24} style={{ marginBottom: 24 }}>
      <Col span={12}>
        <Search
          placeholder="Search services..."
          defaultValue={searchParams.search}
          onSearch={(value) => updateParam("search", value)}
          allowClear
        />
      </Col>
      <Col span={6}>
        <Select
          defaultValue={sort}
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
