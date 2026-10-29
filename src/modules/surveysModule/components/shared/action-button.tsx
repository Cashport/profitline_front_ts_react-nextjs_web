"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/utils";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  loading?: boolean;
}

/**
 * Acción de Encuestas con los botones de la referencia (docs/DESIGN.md §8):
 * secundario blanco con borde #e3e3e3 y primario lima. SecondaryButton fija
 * un borde negro, por eso no se usa aquí.
 */
export default function ActionButton({
  variant = "secondary",
  icon,
  loading,
  disabled,
  className,
  children,
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "box-border flex h-[var(--control-h)] shrink-0 items-center justify-center gap-2 whitespace-nowrap px-4 text-[16px] transition-colors disabled:cursor-not-allowed [&_svg]:h-[18px] [&_svg]:w-[18px]",
        variant === "primary"
          ? "rounded-[13px] bg-cp-lime font-semibold text-cp-ink hover:bg-[#b9d417] disabled:bg-[#efefe9] disabled:text-[#a3a3a3]"
          : "rounded-[11px] border border-cp-line-2 bg-cp-surface font-medium text-cp-ink-2 hover:border-[#c4c4c4] disabled:opacity-50 disabled:hover:border-cp-line-2",
        className
      )}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
