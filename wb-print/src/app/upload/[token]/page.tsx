import { IntakeUpload } from "@/components/intake-upload";

export const dynamic = "force-dynamic";

export default async function UploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <IntakeUpload token={token} />;
}