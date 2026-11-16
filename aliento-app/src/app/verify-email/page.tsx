import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Подтверждение email",
  description: "Подтверждение email аккаунта Aliento.",
  path: "/verify-email",
});

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const target = email
    ? `/register/check-email?email=${encodeURIComponent(email)}`
    : "/register/check-email";
  redirect(target);
}
