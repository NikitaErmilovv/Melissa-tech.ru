import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import { startWorker } from "@/lib/worker";
import "./globals.css";

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const heading = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: "DODJ — печать",
  description: "Приём фото с Wildberries и печать заказов DODJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  startWorker();
  return (
    <html lang="ru" className={`${sans.variable} ${heading.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
