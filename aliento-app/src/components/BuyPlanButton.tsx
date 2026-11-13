"use client";

import { useState, useTransition } from "react";
import { buyPlanAction } from "@/actions/payments";

export function BuyPlanButton({ planId, label = "Оплатить" }: { planId: string; label?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await buyPlanAction(planId);
            if ("error" in result && result.error) {
              setMessage(result.error);
              return;
            }
            if (result.confirmationUrl) {
              window.location.href = result.confirmationUrl;
            }
          });
        }}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {pending ? "Переход к оплате…" : label}
      </button>
      {message && <p className="mt-3 text-xs text-muted">{message}</p>}
    </div>
  );
}
