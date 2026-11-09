import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppFrame } from "@/components/AppFrame";
import { siteConfig } from "@/lib/site";
import { serviceJsonLd } from "@/lib/json-ld";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — школа бачаты`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "Education",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} — школа бачаты`,
    description: siteConfig.description,
    url: siteConfig.url,
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
    title: `${siteConfig.name} — школа бачаты`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/logo-32.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/images/logo-192.png", type: "image/png", sizes: "192x192" }],
  },
  manifest: "/manifest.webmanifest",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: "Aliento школа бачаты",
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo-512.png`,
  description: siteConfig.description,
  sameAs: [siteConfig.telegram.channel],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: siteConfig.telegram.direct,
      availableLanguage: ["Russian"],
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "ru-RU",
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user =
    process.env.ALIENTO_MELISSA_EXPORT === "1" ? null : await getCurrentUser();

  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{document.documentElement.classList.remove('light');document.documentElement.style.colorScheme='dark';localStorage.removeItem('aliento-theme');}catch(e){}})();`}
        </Script>
        <Script
          id="ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          id="ld-service-global"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd()) }}
        />
        <div className="grain-overlay" />
        <AppFrame user={user}>{children}</AppFrame>
      </body>
    </html>
  );
}
