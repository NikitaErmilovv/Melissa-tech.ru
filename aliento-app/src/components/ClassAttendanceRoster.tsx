"use client";

import { useMemo, useState } from "react";
import { AttendanceStudentButtons } from "@/components/AttendanceStudentButtons";

type StudentRow = {
  id: string;
  name: string;
  phone: string;
  blocked: boolean;
  attendanceStatus?: "PRESENT" | "ABSENT";
};

export function ClassAttendanceRoster({
  classId,
  students,
}: {
  classId: string;
  students: StudentRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q)
    );
  }, [query, students]);

  const presentCount = students.filter((s) => s.attendanceStatus === "PRESENT").length;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted">
          Отмечено присутствующих:{" "}
          <span className="text-foreground">
            {presentCount} из {students.length}
          </span>
        </p>
        <div className="min-w-[200px] flex-1 sm:max-w-xs">
          <label className="field-label" htmlFor="student-search">
            Поиск ученика
          </label>
          <input
            id="student-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field"
            placeholder="Имя или телефон"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Телефон</th>
              <th className="text-right">На занятии</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-muted">
                  Никого не найдено.
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr key={student.id} className={student.blocked ? "opacity-50" : undefined}>
                <td className="text-foreground">{student.name}</td>
                <td>{student.phone}</td>
                <td className="text-right">
                  {student.blocked ? (
                    <span className="text-xs text-muted">Заблокирован</span>
                  ) : (
                    <AttendanceStudentButtons
                      classId={classId}
                      userId={student.id}
                      initialStatus={student.attendanceStatus}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
