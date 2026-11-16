import { OrderView } from "@/components/order-view";
import { Shell } from "@/components/shell";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell>
      <OrderView id={id} />
    </Shell>
  );
}
