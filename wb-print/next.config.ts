import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["**.cursorvm.com", "*.cursorvm.com"],
  serverExternalPackages: ["sharp"],
  experimental: {
    middlewareClientMaxBodySize: "128mb",
    serverActions: {
      bodySizeLimit: "128mb",
    },
  },
};

export default nextConfig;
