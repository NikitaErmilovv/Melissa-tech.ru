import type { NextConfig } from "next";

const melissaExport = process.env.ALIENTO_MELISSA_EXPORT === "1";

const extraDevOrigins =
  process.env.ALIENTO_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  // Tunnel / LAN access in dev — without this, HMR WebSocket fails and the page reloads ~every minute.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "172.18.0.1",
    "172.30.0.2",
    "*.trycloudflare.com",
    ...extraDevOrigins,
  ],
  experimental: {
    cpus: 2,
  },
  ...(melissaExport
    ? {
        basePath: "/aliento",
        assetPrefix: "/aliento",
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
