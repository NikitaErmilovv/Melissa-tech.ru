import type { Metadata } from "next";
import { siteConfig } from "./site";

interface PageMetaInput {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}

export function buildMetadata({ title, description, path = "", keywords }: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.fullName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}
