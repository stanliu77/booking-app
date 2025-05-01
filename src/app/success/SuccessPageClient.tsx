"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPageClient() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/dashboard/user/appointments";
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="text-5xl text-green-500">✅</div>
      <h2 className="text-2xl font-semibold">Payment Successful!</h2>
      <p className="text-gray-600">Your appointment has been confirmed.</p>
      <p className="text-sm text-gray-400">Redirecting to appointments...</p>
    </div>
  );
}
