"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/cn";

export function LogoutButton({ className, label = "Выйти" }: { className?: string; label?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={cn("side-link w-full", className)}>
        <LogOut className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
