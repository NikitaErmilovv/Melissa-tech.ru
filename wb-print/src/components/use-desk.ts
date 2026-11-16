"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicState } from "@/lib/types";

export function useDesk() {
  const [data, setData] = useState<PublicState | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) throw new Error("панель не ответила");
      setData((await response.json()) as PublicState);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "нет связи");
    }
  }, []);

  useEffect(() => {
    void reload();
    const timer = setInterval(() => void reload(), 4000);
    return () => clearInterval(timer);
  }, [reload]);

  return { data, error, reload };
}

export async function send(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "не получилось");
  return payload;
}

export function postJson(path: string, body: unknown, method = "POST") {
  return send(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
