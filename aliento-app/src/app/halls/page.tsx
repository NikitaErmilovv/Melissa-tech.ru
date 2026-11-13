import { redirect } from "next/navigation";

export default async function HallsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  redirect(week ? `/schedule?week=${week}` : "/schedule");
}
