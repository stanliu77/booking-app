"use client";

import { Card, List, Rate, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

interface Review {
  rating: number;
  comment: string;
  createdAt: Date;
  user: { email: string };
}

interface Props {
  serviceName: string;
  avgRating: string | null;
  reviews: Review[];
}

export default function ServiceReviewClient({
  serviceName,
  avgRating,
  reviews,
}: Props) {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>
        Reviews for: <Text strong>{serviceName}</Text>
      </Title>

      {avgRating && (
        <Paragraph>
          <Text strong>Average Rating:</Text>{" "}
          <Rate disabled defaultValue={parseFloat(avgRating)} /> ({avgRating})
        </Paragraph>
      )}

      {reviews.length === 0 ? (
        <Paragraph>No reviews yet for this service.</Paragraph>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={reviews}
          renderItem={(review, index) => (
            <Card key={index} style={{ marginBottom: 16 }}>
              <Rate disabled defaultValue={review.rating} />
              <Paragraph style={{ marginTop: 8 }}>{review.comment}</Paragraph>
              <Text type="secondary">
                By {review.user.email} on{" "}
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          )}
        />
      )}
    </div>
  );
}
