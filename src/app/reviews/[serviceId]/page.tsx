import { prisma } from "@/app/lib/db";
import { notFound } from "next/navigation";
import ServiceReviewClient from "./ServiceReviewClient";
interface Props {
  params: { serviceId: string };
}

export default async function ServiceReviewPage({ params }: Props) {
  const serviceId = params.serviceId;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) return notFound();

  const reviews = await prisma.review.findMany({
    where: { serviceId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <ServiceReviewClient
      serviceName={service.name}
      reviews={reviews}
      avgRating={avgRating}
    />
  );
}
