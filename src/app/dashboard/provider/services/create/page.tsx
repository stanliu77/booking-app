'use client';

import { useRouter } from 'next/navigation'
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Space,
  Typography,
  message,
  Upload,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import ProviderNavbar from '@/app/componets/ProviderNavbar';

const { Title } = Typography;

export default function CreateServicePage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: any) => {
    console.log("📦 Submitting values:", values);

    try {
      const imageUrlString = Array.isArray(values.imageUrl)
        ? values.imageUrl[0]?.url
        : values.imageUrl;

      const res = await axios.post('/api/services', {
        ...values,
        imageUrl: imageUrlString,
        timeSlots: values.timeSlots.map((slot: any) => ({
          start: slot.time[0].toISOString(),
          end: slot.time[1].toISOString(),
        })),
      });

      if (res.status === 201 || res.status === 200) {
        message.success('Service created successfully');
        router.push('/dashboard/provider/services');
      } else {
        message.error('Failed to create service');
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      message.error('Failed to create service');
    }
  };

  return (
    <>
    <ProviderNavbar/>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Create New Service</Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Service Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber min={0} addonAfter="$" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Duration (minutes)" name="duration" rules={[{ required: true }]}>
          <InputNumber min={5} max={240} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
  label="Image"
  name="imageUrl"
  valuePropName="fileList"
  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
>
  <Upload
    name="file"
    listType="picture-card"
    accept="image/*"
    customRequest={async ({ file, onSuccess }) => {
      const formData = new FormData();
      formData.append('file', file as Blob);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      const newFile = {
        uid: (file as any).uid,
        name: (file as any).name,
        url: data.url,
        status: 'done',
        response: data, // 👈 重要！为 onChange 提供 data.url
      };

      form.setFieldsValue({ imageUrl: [newFile] });

      onSuccess?.(data, file);
    }}
    fileList={form.getFieldValue('imageUrl') || []}
    onChange={({ fileList }) => {
      const updatedList = fileList.map(file => {
        if (file.response?.url) {
          return { ...file, url: file.response.url };
        }
        return file;
      });
      form.setFieldsValue({ imageUrl: updatedList });
    }}
    showUploadList={{ showPreviewIcon: false }}
  >
    {!(form.getFieldValue('imageUrl')?.length >= 1) && (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    )}
  </Upload>
</Form.Item>

        <Form.List name="timeSlots">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'time']}
                    rules={[{ required: true, message: 'Please select time range' }]}
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
            Create Service
          </Button>
        </Form.Item>
      </Form>
    </div>
    </>
  );
}
