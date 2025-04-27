"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Rate, Input, Button, Typography, message, Spin } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ReviewPage() {
  const { appointmentId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    // 可扩展：校验是否允许评价
    setLoading(false);
  }, []);

  const submitReview = async () => {
    if (!comment.trim() || rating === 0) {
      return message.warning("Please provide both a rating and a comment.");
    }

    setDisabled(true);
    try {
      const res = await fetch("/api/review", {
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
        message.success("Review submitted successfully!");
        setTimeout(() => {
          router.push("/dashboard/user");
        }, 1000); // 小停顿让用户看到提示
      }
    } catch (err) {
      message.error("Request failed");
    } finally {
      setDisabled(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
        Leave a Review
      </Title>

      <div style={{ marginBottom: 24 }}>
        <Text strong>Rating:</Text>
        <br />
        <Rate value={rating} onChange={setRating} style={{ marginTop: 8 }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Text strong>Comment:</Text>
        <br />
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          style={{ marginTop: 8 }}
        />
      </div>

      <Button
        type="primary"
        onClick={submitReview}
        disabled={disabled}
        block
        size="large"
      >
        Submit Review
      </Button>
    </div>
  );
}
