"use client";

import { useState } from "react";
import { normalizeVerificationCode } from "@/lib/email-verification";

export function VerificationCodeInput({
  id = "code",
  name = "code",
  required,
  className = "field text-center text-2xl tracking-[0.35em] font-display",
}: {
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      value={value}
      onChange={(event) => setValue(normalizeVerificationCode(event.target.value))}
      required={required}
      className={className}
      maxLength={6}
      pattern="[0-9]{6}"
      title="6 цифр из письма"
    />
  );
}
