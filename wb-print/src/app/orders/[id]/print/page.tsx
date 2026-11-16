import { notFound } from "next/navigation";
import { PrintBar } from "@/components/print-bar";
import { readDb } from "@/lib/db";
import { countPhrase } from "@/lib/text";
import { formatStamp } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = readDb().orders.find((item) => item.id === id);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-white px-6 py-6 text-black">
    <div className="mx-auto max-w-4xl">
      <PrintBar id={order.id} />
      <header className="border-b border-black pb-4">
        <p className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase">DODJ</p>
        <h1 className="mt-1 font-serif text-4xl">№ {order.wbOrderId}</h1>
        <p className="mt-2 text-sm">
          {order.articleTitle} · {order.vendorCode || "без артикула"} · {order.files.length} из {order.expectedPhotos ? countPhrase(order.expectedPhotos, order.kind || "photo") : "—"}
        </p>
        <p className="text-sm">{formatStamp(order.createdAt)} · {order.clientName || "без имени"}</p>
      </header>
      {order.files.length === 0 ? <p className="mt-8 text-sm">{order.kind === "sticker" ? "В папке нет макетов." : "В папке нет фото."}</p> : null}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {order.files.map((file, index) => (
          <figure key={file.id} className="break-inside-avoid">
            {file.contentType.includes("heic") ? (
              <div className="grid h-64 place-items-center border border-black text-sm">HEIC · {file.name}</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/files/${order.id}/${file.id}`} alt={file.name} className="w-full" />
            )}
            <figcaption className="mt-1 text-xs">
              {index + 1}. {file.name}
            </figcaption>
          </figure>
        ))}
      </div>
      </div>
    </div>
  );
}
