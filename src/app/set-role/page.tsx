"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Store } from "lucide-react";

export default function SetRolePage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/get-role");
        if (res.ok) {
          const data = await res.json();
          if (data.role === "USER") {
            router.push("/dashboard/user");
          } else if (data.role === "PROVIDER") {
            router.push("/dashboard/provider");
          } else {
            setChecking(false); // 没有角色，显示选择界面
          }
        } else {
          setChecking(false); // 请求失败也让用户手动选
        }
      } catch (err) {
        console.error("❌ Failed to check role:", err);
        setChecking(false);
      }
    };

    checkRole();
  }, [router]);

  const handleSelect = async (selectedRole: "USER" | "PROVIDER") => {
    const res = await fetch("/api/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole }),
    });

    if (res.ok) {
      router.push(selectedRole === "USER" ? "/dashboard/user" : "/dashboard/provider");
    } else {
      console.error("Failed to set role");
    }
  };

  if (checking) return null; // ✅ 检查中不渲染页面

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-8">Please select your role</h1>
        <div className="flex gap-8">
          <button
            onClick={() => handleSelect("USER")}
            className="w-64 h-40 flex flex-col items-center justify-center border rounded-2xl shadow hover:shadow-lg transition"
          >
            <User size={48} className="mb-4" />
            <span className="text-lg font-medium">Continue as User</span>
          </button>
          <button
            onClick={() => handleSelect("PROVIDER")}
            className="w-64 h-40 flex flex-col items-center justify-center border rounded-2xl shadow hover:shadow-lg transition"
          >
            <Store size={48} className="mb-4" />
            <span className="text-lg font-medium">Continue as Provider</span>
          </button>
        </div>
      </div>
    </div>
  );
}
