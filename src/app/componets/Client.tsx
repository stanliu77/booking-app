'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, message } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface ImageItem {
  url: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string | ImageItem[];
}

export default function MyServicesClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Failed to fetch services');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const deleteService = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/services/${id}`);
      message.success('Service deleted');
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      message.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl?: string | ImageItem[]) => {
    if (!imageUrl) return null;
    if (typeof imageUrl === 'string') return imageUrl;
    if (Array.isArray(imageUrl) && imageUrl.length > 0) return imageUrl[0].url;
    return null;
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>My Services</Title>
        <Link href="/dashboard/provider/services/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Service
          </Button>
        </Link>
      </Space>

      {services.length === 0 ? (
        <Text type="secondary">You haven't created any services yet.</Text>
      ) : (
        services.map(service => {
          const thumbnail = getImageUrl(service.imageUrl);
          return (
            <Card
              key={service.id}
              styles={{
                body: {
                  padding: 24,
                },
              }}
              style={{
                marginBottom: 32,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={service.name}
                    style={{
                      width: '100%',
                      height: '50vh',
                      objectFit: 'cover',
                      borderRadius: 10,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                      marginBottom: 16,
                    }}
                  />
                )}
                <Title level={4} style={{ margin: 0 }}>{service.name}</Title>
                <Text type="secondary">{service.description}</Text>
                <Text>
                  <strong>Price:</strong> ${service.price.toFixed(2)} |{' '}
                  <strong>Duration:</strong> {service.duration} minutes
                </Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/dashboard/provider/services/${service.id}/edit`)}
                  >
                    Update
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    loading={loading}
                    onClick={() => deleteService(service.id)}
                  >
                    Delete
                  </Button>
                  <Link href={`/reviews/${service.id}`}>
                    <Button>View Reviews</Button>
                  </Link>
                </Space>
              </Space>
            </Card>
          );
        })
      )}
    </div>
  );
}
