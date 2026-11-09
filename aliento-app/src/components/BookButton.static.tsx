"use client";

import Link from "next/link";

export function BookButton({
  disabledReason,
  label = "Записаться",
}: {
  classId: string;
  disabledReason?: string;
  label?: string;
}) {
  if (disabledReason) {
    return <span className="badge badge-muted">{disabledReason}</span>;
  }

  return (
    <Link href="/login" className="btn btn-primary btn-sm">
      {label}
    </Link>
  );
}
