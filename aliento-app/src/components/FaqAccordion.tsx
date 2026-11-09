"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FaqItem } from "@/lib/faq-data";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="app-card divide-y divide-border overflow-hidden !p-0">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-8 md:px-10 md:py-8"
              >
                <span className="card-title min-w-0 text-base md:text-lg">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
                    open && "rotate-180 text-accent-300"
                  )}
                />
              </button>
            </h3>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="prose-body px-5 pb-5 sm:px-8 md:px-10 md:pb-9">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
