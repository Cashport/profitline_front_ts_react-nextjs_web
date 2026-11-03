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
 * secundario blanco con borde #e3e3e3 y primario lima, del alto y la letra de
 * los demás botones del header. SecondaryButton fija un borde negro, por eso
 * no se usa aquí.
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
        "box-border flex h-[var(--control-h)] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-4 text-[14px] transition-colors disabled:cursor-not-allowed [&_svg]:h-4 [&_svg]:w-4",
        variant === "primary"
          ? "rounded-[10px] border-0 bg-cp-lime font-semibold text-cp-ink hover:bg-cp-lime-dark disabled:bg-[#efefe9] disabled:text-[#a3a3a3]"
          : "rounded-lg border border-cp-line-2 bg-cp-surface font-medium text-cp-ink hover:border-[#c4c4c4] disabled:opacity-50 disabled:hover:border-cp-line-2",
        className
      )}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
