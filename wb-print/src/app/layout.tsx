import type { Metadata } from "next";
import { startWorker } from "@/lib/worker";
import "./globals.css";

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
    <html lang="ru" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
