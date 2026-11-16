"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/ButtonLink";
import { updateStudentProfileAction } from "@/actions/admin";
import { MaskedBirthDateInput } from "@/components/MaskedBirthDateInput";
import { MaskedPhoneInput } from "@/components/MaskedPhoneInput";
import { formatBirthDateFromIso } from "@/lib/birthdays";
import { isValidRuPhone } from "@/lib/phone";

function SaveStudentButton() {
  const { pending } = useFormStatus();
  return <SubmitButton disabled={pending}>{pending ? "Сохраняем…" : "Сохранить"}</SubmitButton>;
}

export function AdminStudentEditForm({
  studentId,
  name,
  email,
  phone,
  dateOfBirth,
  canEditLogin,
}: {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  canEditLogin: boolean;
}) {
  const dobDefault = dateOfBirth ? formatBirthDateFromIso(dateOfBirth) : undefined;

  return (
    <section className="app-card">
      <h2 className="app-card-title">Редактировать ученика</h2>
      <form
        action={updateStudentProfileAction}
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          const phoneValue = new FormData(event.currentTarget).get("phone");
          if (typeof phoneValue !== "string" || !isValidRuPhone(phoneValue)) {
            event.preventDefault();
            window.alert("Введите полный номер телефона: +7 (XXX) XXX-XX-XX");
          }
        }}
      >
        <input type="hidden" name="studentId" value={studentId} />
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="editName">
            Имя и фамилия
          </label>
          <input id="editName" name="name" required defaultValue={name} className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="editPhone">
            Телефон
          </label>
          <MaskedPhoneInput id="editPhone" name="phone" required defaultValue={phone} />
        </div>
        {canEditLogin ? (
          <div>
            <label className="field-label" htmlFor="editDob">
              Дата рождения <span className="text-muted">(необязательно)</span>
            </label>
            <MaskedBirthDateInput id="editDob" name="dateOfBirth" defaultValue={dateOfBirth} />
          </div>
        ) : (
          <div>
            <label className="field-label">Дата рождения</label>
            <input value={dobDefault ?? "—"} disabled className="field opacity-60" />
          </div>
        )}
        {canEditLogin ? (
          <>
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="editEmail">
                Email (логин)
              </label>
              <input
                id="editEmail"
                name="email"
                type="email"
                required
                defaultValue={email}
                className="field"
                autoComplete="off"
              />
            </div>
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="newPassword">
                Новый пароль <span className="text-muted">(оставьте пустым, если не меняете)</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={6}
                autoComplete="new-password"
                className="field"
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <label className="field-label">Email (логин)</label>
            <input value={email} disabled className="field opacity-60" />
          </div>
        )}
        <div className="md:col-span-2">
          <SaveStudentButton />
        </div>
      </form>
    </section>
  );
}
