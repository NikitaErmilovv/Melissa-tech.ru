import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["**.cursorvm.com", "*.cursorvm.com"],
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
