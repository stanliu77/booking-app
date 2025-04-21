// app/dashboard/user/review/[appointmentId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Rate, Input, Button, Typography, message, Spin } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function ReviewPage() {
  const { appointmentId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    // 可扩展：请求接口验证是否已评价或是否允许评价
    setLoading(false);
  }, []);

  const submitReview = async () => {
    if (!comment || rating === 0) {
      return message.warning("Please provide a rating and comment.");
    }

    setDisabled(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "Failed to submit review");
      } else {
        message.success("Review submitted!");
        router.push("/dashboard/user");
      }
    } catch (err) {
      message.error("Request failed");
    } finally {
      setDisabled(false);
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <Title level={3}>Leave a Review</Title>

      <label>Rating:</label>
      <Rate value={rating} onChange={setRating} style={{ marginBottom: 16 }} />

      <label>Comment:</label>
      <TextArea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <Button type="primary" onClick={submitReview} disabled={disabled}>
        Submit Review
      </Button>
    </div>
  );
}
