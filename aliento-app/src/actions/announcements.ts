"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/actions/auth";
import { isAdmin } from "@/lib/format";

export async function createAnnouncementAction(formData: FormData) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) redirect("/login");

  const tag = String(formData.get("tag") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!tag || !title || !body) {
    redirect("/admin/announcements?error=Заполните все поля.");
  }

  await prisma.announcement.create({ data: { tag, title, body } });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?created=1");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
}
