"use client";

import { useMemo, useState } from "react";
import { createHallRentalAction } from "@/actions/halls";
import { buildTimeSlotLabels } from "@/lib/hall-grid";
import type { Venue } from "@/lib/db";
import type { HallActivityType } from "@/lib/hall-activity-types";

const DURATIONS = [
  { value: 30, label: "30 минут" },
  { value: 60, label: "1 час" },
  { value: 90, label: "1,5 часа" },
  { value: 120, label: "2 часа" },
  { value: 150, label: "2,5 часа" },
  { value: 180, label: "3 часа" },
  { value: 240, label: "4 часа" },
];

export function HallRentalForm({
  venues,
  weekStartIso,
  activityTypes,
}: {
  venues: Venue[];
  weekStartIso: string;
  activityTypes: HallActivityType[];
}) {
  const timeOptions = buildTimeSlotLabels().slice(0, -1);
  const [venueId, setVenueId] = useState(venues[0]?.id ?? "");
  const [activityTypeId, setActivityTypeId] = useState(activityTypes[0]?.id ?? "other");
  const [color, setColor] = useState(activityTypes[0]?.color ?? "#8d99ae");
  const halls = useMemo(() => venues.find((v) => v.id === venueId)?.halls ?? [], [venues, venueId]);

  function handleTypeChange(nextId: string) {
    setActivityTypeId(nextId);
    const nextType = activityTypes.find((item) => item.id === nextId);
    if (nextType) setColor(nextType.color);
  }

  return (
    <section className="app-card">
      <h2 className="app-card-title">Добавить занятие в календарь</h2>
      <p className="card-body mt-2 text-sm">
        Занятия школы подтягиваются из расписания автоматически. Здесь можно добавить любой слот — своё
        название и цвет.
      </p>
      <form action={createHallRentalAction} className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="week" value={weekStartIso} />

        <label className="block md:col-span-2 lg:col-span-3">
          <span className="field-label">Название в календаре</span>
          <input
            name="title"
            className="field !mt-1.5"
            placeholder="Например: Студия Move, репетиция, kizomba"
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Направление</span>
          <select
            name="activityTypeId"
            className="field !mt-1.5"
            value={activityTypeId}
            onChange={(e) => handleTypeChange(e.target.value)}
            required
          >
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Цвет в таблице</span>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface p-1"
            />
            <span className="text-sm text-muted">Можно изменить от дефолта направления</span>
          </div>
        </label>

        <label className="block">
          <span className="field-label">Площадка</span>
          <select
            name="venueId"
            className="field !mt-1.5"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            required
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Зал</span>
          <select name="hall" className="field !mt-1.5" value={halls[0] ?? ""} key={venueId} required>
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Дата</span>
          <input type="date" name="date" className="field !mt-1.5" required />
        </label>

        <label className="block">
          <span className="field-label">Начало</span>
          <select name="startTime" className="field !mt-1.5" defaultValue="10:00" required>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Длительность</span>
          <select name="durationMinutes" className="field !mt-1.5" defaultValue="90" required>
            {DURATIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Контакт / группа (необязательно)</span>
          <input name="clientName" className="field !mt-1.5" placeholder="Для внутренней заметки" />
        </label>

        <label className="block">
          <span className="field-label">Количество человек</span>
          <input
            name="peopleCount"
            type="number"
            min={1}
            defaultValue={6}
            className="field !mt-1.5"
            required
          />
        </label>

        <label className="block md:col-span-2 lg:col-span-3">
          <span className="field-label">Комментарий (необязательно)</span>
          <input name="notes" className="field !mt-1.5" placeholder="Например: репетиция перед показом" />
        </label>

        <div className="md:col-span-2 lg:col-span-3">
          <button type="submit" className="btn btn-primary">
            Добавить в календарь
          </button>
        </div>
      </form>
    </section>
  );
}
