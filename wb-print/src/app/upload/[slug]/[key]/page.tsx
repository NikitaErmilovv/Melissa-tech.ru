import { IntakeUpload } from "@/components/intake-upload";

export const dynamic = "force-dynamic";

export default async function UploadPage({ params }: { params: Promise<{ slug: string; key: string }> }) {
  const { slug, key } = await params;
  return <IntakeUpload slug={slug} intakeKey={key} />;
}