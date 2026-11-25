"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { syncPaymentAction } from "@/actions/payments";

export function PaymentReturnBanner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment");
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "muted" | "danger">("muted");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!paymentId) return;

    startTransition(async () => {
      const result = await syncPaymentAction(paymentId);
      if ("error" in result && result.error) {
        setMessage(result.error);
        setTone("danger");
        return;
      }
      if ("status" in result && result.status === "PAID") {
        setMessage("Оплата прошла успешно — абонемент активирован.");
        setTone("success");
      } else if ("status" in result && result.status === "CANCELLED") {
        setMessage("Оплата отменена. Вы можете попробовать снова.");
        setTone("muted");
      } else if ("ok" in result && result.ok) {
        setMessage("Оплата прошла успешно — абонемент активирован.");
        setTone("success");
      } else {
        setMessage("Платёж обрабатывается. Если абонемент не появился — обновите страницу через минуту.");
        setTone("muted");
      }
      router.replace("/cabinet/subscriptions", { scroll: false });
    });
  }, [paymentId, router]);

  if (!paymentId || !message) return null;

  const className =
    tone === "success"
      ? "border-success/40 text-success"
      : tone === "danger"
        ? "border-danger/40 text-danger"
        : "border-border-strong text-muted";

  return (
    <p className={`app-card mb-5 border text-sm ${className}`} role="status">
      {message}
    </p>
  );
}
