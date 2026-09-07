"use client";

import { cn } from "@/utils/utils";
import type { Sev } from "../../types";

const SEV_CLASS: Record<Sev, string> = {
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  crit: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  idle: "bg-muted text-muted-foreground"
};

interface StatusChipProps {
  sev: Sev;
  children: React.ReactNode;
  className?: string;
}

export default function StatusChip({ sev, children, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        SEV_CLASS[sev],
        className
      )}
    >
      {children}
    </span>
  );
}
