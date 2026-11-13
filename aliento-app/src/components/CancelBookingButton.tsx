"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/actions/studio";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (message) return <span className="text-xs text-muted">{message}</span>;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await cancelBookingAction(bookingId);
          if (result.error) setMessage(result.error);
          else router.refresh();
        });
      }}
      className="btn btn-secondary btn-sm disabled:opacity-60"
    >
      {pending ? "Отменяем…" : "Отменить"}
    </button>
  );
}
