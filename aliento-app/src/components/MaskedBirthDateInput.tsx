"use client";

import { useState } from "react";
import {
  formatBirthDateFromIso,
  formatBirthDateInput,
  parseBirthDateDisplay,
} from "@/lib/birthdays";

export function MaskedBirthDateInput({
  id = "dateOfBirth",
  name = "dateOfBirth",
  required,
  className = "field",
  defaultValue,
}: {
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
}) {
  const [display, setDisplay] = useState(() =>
    defaultValue ? formatBirthDateFromIso(defaultValue) : ""
  );
  const iso = parseBirthDateDisplay(display) ?? "";

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder="ДД.ММ.ГГГГ"
        value={display}
        onChange={(event) => setDisplay(formatBirthDateInput(event.target.value))}
        className={className}
        maxLength={10}
      />
      <input type="hidden" name={name} value={iso} required={required} />
    </>
  );
}
