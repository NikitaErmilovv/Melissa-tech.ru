import { redirect } from "next/navigation";
import { intakeLink } from "@/lib/intake-link";
import { orderByIntakeToken } from "@/lib/intake-token";

export const dynamic = "force-dynamic";

/** Старые односегментные ссылки → редирект на /upload/номер/ключ */
export default async function LegacyUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = orderByIntakeToken(token);
  if (!order) {
    return (
      <p className="mx-auto max-w-lg px-4 py-10 text-sm text-muted-foreground">Ссылка устарела или недействительна.</p>
    );
  }
  const target = new URL(intakeLink(order));
  redirect(`${target.pathname}${target.search}`);
}