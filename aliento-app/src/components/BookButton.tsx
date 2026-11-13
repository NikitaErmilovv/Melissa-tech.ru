"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookClassAction } from "@/actions/studio";

export function BookButton({
  classId,
  disabledReason,
  label = "Записаться",
}: {
  classId: string;
  disabledReason?: string;
  label?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (disabledReason) {
    return <span className="badge badge-muted">{disabledReason}</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await bookClassAction(classId);
            setMessage(result.error ?? "Вы записаны на занятие.");
            if (!result.error) router.refresh();
          });
        }}
        className="btn btn-primary btn-sm disabled:opacity-60"
      >
        {pending ? "Записываем…" : label}
      </button>
      {message && <p className="mt-2 text-xs text-accent-300">{message}</p>}
    </div>
  );
}
