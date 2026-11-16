"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HallGridCell, HallGridColumn } from "@/lib/hall-grid";
import { cn } from "@/lib/cn";

export function HallOccupancyGrid({
  title,
  columns,
  rows,
  focusDateIso,
  canManage = false,
  onDeleteRental,
}: {
  title?: string;
  columns: HallGridColumn[];
  rows: { timeLabel: string; cells: Record<string, HallGridCell> }[];
  focusDateIso?: string;
  canManage?: boolean;
  onDeleteRental?: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, columns]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !focusDateIso) return;

    const target = el.querySelector(`[data-hall-date="${focusDateIso}"]`) as HTMLElement | null;
    if (!target) return;

    const frame = requestAnimationFrame(() => {
      const left = target.offsetLeft - el.clientWidth / 2 + target.offsetWidth / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "auto" });
      updateScrollButtons();
    });

    return () => cancelAnimationFrame(frame);
  }, [focusDateIso, columns, updateScrollButtons]);

  function scrollPage(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.65, 240), behavior: "smooth" });
  }

  return (
    <section className="app-card hall-grid-shell">
      {title && <h2 className="app-card-title">{title}</h2>}
      <div className={cn("hall-grid-viewport", title && "mt-5")}>
        {canPrev && (
          <button
            type="button"
            className="hall-grid-scroll-btn hall-grid-scroll-btn-prev"
            aria-label="Листать расписание назад"
            onClick={() => scrollPage(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div ref={scrollRef} className="hall-grid-scroll">
          <table className="hall-grid">
            <thead>
              <tr>
                <th className="hall-grid-sticky-time">Время</th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    data-hall-date={column.date}
                    className={cn(
                      "hall-grid-date",
                      focusDateIso === column.date && "hall-grid-date-today"
                    )}
                  >
                    {column.dateLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.timeLabel}>
                  <td className="hall-grid-time">{row.timeLabel}</td>
                  {columns.map((column) => {
                    const cell = row.cells[column.key];
                    if (cell?.type === "covered") return null;
                    if (!cell || cell.type === "empty") {
                      return (
                        <td
                          key={column.key}
                          data-hall-date={column.date}
                          className="hall-grid-cell hall-grid-cell-empty"
                        />
                      );
                    }
                    const { block, rowSpan } = cell;
                    return (
                      <td
                        key={column.key}
                        data-hall-date={column.date}
                        rowSpan={rowSpan}
                        className={cn(
                          "hall-grid-cell hall-grid-cell-block",
                          block.kind === "studio" ? "hall-grid-studio" : "hall-grid-rental"
                        )}
                        title={
                          block.kind === "studio"
                            ? `Занятие школы: ${block.label}`
                            : `Аренда: ${block.label}`
                        }
                      >
                        <div className="hall-grid-block-inner">
                          <span className="hall-grid-block-label">
                            {block.label}
                            {block.peopleCount !== undefined ? ` (${block.peopleCount})` : ""}
                          </span>
                          {canManage && block.kind === "rental" && onDeleteRental && (
                            <button
                              type="button"
                              className="hall-grid-delete"
                              aria-label="Удалить аренду"
                              onClick={() => onDeleteRental(block.id)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canNext && (
          <button
            type="button"
            className="hall-grid-scroll-btn hall-grid-scroll-btn-next"
            aria-label="Листать расписание вперёд"
            onClick={() => scrollPage(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}
