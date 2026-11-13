"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markClassStudentAttendanceAction } from "@/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";

export function AttendanceStudentButtons({
  classId,
  userId,
  initialStatus,
}: {
  classId: string;
  userId: string;
  initialStatus?: "PRESENT" | "ABSENT";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [marked, setMarked] = useState(initialStatus);

  if (marked) {
    return <StatusBadge status={marked} />;
  }

  if (message) return <span className="text-xs text-danger">{message}</span>;

  function mark(status: "PRESENT" | "ABSENT") {
    setMessage(null);
    startTransition(async () => {
      const result = await markClassStudentAttendanceAction(classId, userId, status);
      if (result.error) setMessage(result.error);
      else {
        setMarked(status);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
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
        Не был
      </button>
    </div>
  );
}
