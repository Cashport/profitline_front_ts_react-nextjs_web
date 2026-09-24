"use client";

import { cn } from "@/utils/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}

/** Switch pequeño: pastilla + botón, en vez del checkbox nativo. */
export default function ToggleSwitch({ checked, onChange, label, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      <span
        className={cn(
          "relative h-[15px] w-[26px] shrink-0 rounded-full transition-colors",
          checked ? "bg-foreground" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-[11px] w-[11px] rounded-full bg-card shadow-sm transition-all",
            checked ? "left-[13px]" : "left-[2px]"
          )}
        />
      </span>
      {label}
    </button>
  );
}
