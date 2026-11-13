import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.fullName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: process.env.ALIENTO_MELISSA_EXPORT === "1" ? "/aliento/" : "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: siteConfig.themeColor,
    lang: "ru",
    icons: [
      {
        src: "/images/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
