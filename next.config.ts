import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 禁用 ESLint 阻止构建
  },
};

export default nextConfig;
