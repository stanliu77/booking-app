"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  DatePicker,
  Typography,
  Upload,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import ProviderNavbar from '@/app/componets/ProviderNavbar';

const { Title } = Typography;

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`/api/services/${id}`);
        const service = res.data;

        form.setFieldsValue({
          ...service,
          imageUrl: service.imageUrl
            ? [
                {
                  uid: "-1",
                  name: "image",
                  url: service.imageUrl,
                  status: "done",
                },
              ]
            : [],
          timeSlots: service.timeSlots.map((slot: any) => ({
            time: [dayjs(slot.start), dayjs(slot.end)],
          })),
        });
      } catch (err) {
        message.error("Failed to load service");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      const imageUrl =
        Array.isArray(values.imageUrl) && values.imageUrl.length > 0
          ? values.imageUrl[0].url
          : undefined;

      await axios.put(`/api/services/${id}`, {
        ...values,
        imageUrl,
        timeSlots: values.timeSlots.map((slot: any) => ({
          start: slot.time[0].toISOString(),
          end: slot.time[1].toISOString(),
        })),
      });
      message.success("Service updated");
      router.push("/dashboard/provider/services");
    } catch (err) {
      console.error(err);
      message.error("Update failed");
    }
  };

  return (
    <>
    <ProviderNavbar/>
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Title level={3}>Edit Service</Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Service Name" required>
          <Form.Item name="name" noStyle>
            <Input disabled />
          </Form.Item>
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber min={0} addonAfter="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Duration (minutes)" name="duration" rules={[{ required: true }]}>
          <InputNumber min={5} max={240} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Image"
          name="imageUrl"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            listType="picture-card"
            accept="image/*"
            customRequest={async ({ file, onSuccess }) => {
              const formData = new FormData();
              formData.append("file", file as Blob);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              const data = await res.json();
              const newFile: UploadFile = {
                uid: (file as any).uid,
                name: (file as any).name,
                url: data.url,
                status: "done",
              };

              const current = form.getFieldValue("imageUrl") || [];
              form.setFieldsValue({ imageUrl: [newFile] });
              onSuccess?.(data, file);
            }}
          >
            {!(form.getFieldValue("imageUrl")?.length >= 1) && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.List name="timeSlots">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "time"]}
                    rules={[{ required: true, message: "Please select time range" }]}
                  >
                    <DatePicker.RangePicker showTime />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add Time Slot
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Service
          </Button>
        </Form.Item>
      </Form>
    </div>
    </>
  );
}
