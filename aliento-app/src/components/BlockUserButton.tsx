"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBlockUserAction } from "@/actions/admin";

export function BlockUserButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await toggleBlockUserAction(userId);
            if (result.error) setError(result.error);
            else router.refresh();
          });
        }}
        className="btn btn-secondary btn-sm disabled:opacity-60"
      >
        {blocked ? "Разблокировать" : "Заблокировать"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
