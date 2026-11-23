"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelSubscriptionAction, deleteSubscriptionAction } from "@/actions/admin";

export function SubscriptionAdminActions({
  subscriptionId,
  status,
  studentId,
}: {
  subscriptionId: string;
  status: string;
  studentId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isActive = status === "ACTIVE";

  function run(action: () => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {isActive && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Деактивировать абонемент? Ученик не сможет записываться по нему.")) {
                return;
              }
              run(() => cancelSubscriptionAction(subscriptionId));
            }}
            className="btn btn-secondary btn-sm disabled:opacity-60"
          >
            Деактивировать
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                isActive
                  ? "Удалить абонемент полностью? Запись исчезнет из истории."
                  : "Удалить запись об абонементе?"
              )
            ) {
              return;
            }
            run(() => deleteSubscriptionAction(subscriptionId));
          }}
          className="btn btn-ghost btn-sm text-danger disabled:opacity-60"
        >
          Удалить
        </button>
      </div>
      <Link
        href={`/admin/students/${studentId}`}
        className="text-xs text-muted-dim link-underline"
      >
        Карточка ученика
      </Link>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
