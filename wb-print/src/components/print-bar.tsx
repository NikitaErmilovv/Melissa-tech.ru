"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function PrintBar({ id }: { id: string }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href={`/orders/${id}`} className="text-sm underline">
        Назад в папку
      </Link>
      <button type="button" className={buttonVariants({ className: "h-10 bg-black text-white hover:bg-black/80" })} onClick={() => window.print()}>
        Печатать
      </button>
    </div>
  );
}
