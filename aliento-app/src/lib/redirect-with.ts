import { redirect } from "next/navigation";

export function redirectWithQuery(path: string, params: Record<string, string>): never {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `${path}?${query}` : path);
}
