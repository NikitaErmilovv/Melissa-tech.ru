"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAttendanceAction } from "@/actions/admin";

export function AttendanceButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (message) return <span className="text-xs text-muted">{message}</span>;

  function mark(status: "PRESENT" | "ABSENT") {
    startTransition(async () => {
      const result = await markAttendanceAction(bookingId, status);
      if (result.error) setMessage(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => mark("PRESENT")}
        className="btn btn-primary btn-sm disabled:opacity-60"
      >
        Был
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => mark("ABSENT")}
        className="btn btn-secondary btn-sm disabled:opacity-60"
      >
        Пропуск
      </button>
    </div>
  );
}
