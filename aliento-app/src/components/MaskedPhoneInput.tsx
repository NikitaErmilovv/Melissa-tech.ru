"use client";

import { useState } from "react";
import {
  formatPhoneFromDigits,
  normalizePhoneDigits,
  phoneDigits,
} from "@/lib/phone";

export function MaskedPhoneInput({
  id = "phone",
  name = "phone",
  required,
  className = "field",
  defaultValue,
  placeholder = "+7 (900) 000-00-00",
}: {
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [digits, setDigits] = useState(() =>
    defaultValue ? normalizePhoneDigits(defaultValue) : ""
  );
  const display = digits ? formatPhoneFromDigits(digits) : "";

  function handleChange(nextRaw: string, prevDisplay: string) {
    if (!phoneDigits(nextRaw)) {
      setDigits("");
      return;
    }

    let nextDigits = normalizePhoneDigits(nextRaw);

    if (nextRaw.length < prevDisplay.length && nextDigits === digits && nextDigits.length > 1) {
      nextDigits = nextDigits.slice(0, -1);
    }

    setDigits(nextDigits);
  }

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder}
      value={display}
      onChange={(event) => handleChange(event.target.value, display)}
      onFocus={() => {
        if (!digits) setDigits("7");
      }}
      required={required}
      className={className}
    />
  );
}
