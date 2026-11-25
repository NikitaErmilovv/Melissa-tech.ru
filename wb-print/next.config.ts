import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["**.cursorvm.com", "*.cursorvm.com"],
  serverExternalPackages: ["sharp"],
  experimental: {
    middlewareClientMaxBodySize: "2048mb",
    serverActions: {
      bodySizeLimit: "2048mb",
    },
  },
};

export default nextConfig;
