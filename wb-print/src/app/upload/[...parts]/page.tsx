import { notFound, redirect } from "next/navigation";
import { IntakeUpload } from "@/components/intake-upload";
import { intakeLink } from "@/lib/intake-link";
import { orderByIntakeToken } from "@/lib/intake-token";

export const dynamic = "force-dynamic";

export default async function UploadPage({ params }: { params: Promise<{ parts?: string[] }> }) {
  const { parts = [] } = await params;
  if (parts.length === 2) {
    return <IntakeUpload slug={parts[0]} intakeKey={parts[1]} />;
  }
  if (parts.length === 1) {
    const order = orderByIntakeToken(parts[0]);
    if (!order) notFound();
    const target = new URL(intakeLink(order));
    redirect(`${target.pathname}${target.search}`);
  }
  notFound();
}