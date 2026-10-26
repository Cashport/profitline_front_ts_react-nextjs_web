"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";

import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";
import { useWalletTheme } from "../../contexts/wallet-theme-context";

const THEME_OPTIONS: { key: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
  { key: "light", label: "Claro", Icon: Sun },
  { key: "dark", label: "Oscuro", Icon: Moon },
  { key: "system", label: "Sistema", Icon: Laptop }
];

export default function WalletThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useWalletTheme();

  const TriggerIcon = THEME_OPTIONS.find((o) => o.key === theme)?.Icon ?? Sun;

  const items: DropdownItem[] = THEME_OPTIONS.map(({ key, label, Icon }) => ({
    key,
    icon: <Icon className="w-4 h-4" />,
    label: (
      <span
        className={
          theme === key
            ? "text-primary font-semibold"
            : resolvedTheme === "dark"
              ? "text-white"
              : "text-foreground"
        }
      >
        {label}
      </span>
    ),
    onClick: () => setTheme(key)
  }));

  return (
    <GeneralDropdown items={items} align="end">
      <button
        type="button"
        aria-label="Cambiar tema"
        className="flex h-[var(--control-h)] w-[var(--control-h)] shrink-0 items-center justify-center rounded-[11px] border border-cp-line-2 bg-cp-surface text-cp-ink transition-colors hover:border-cp-ink"
      >
        <TriggerIcon className="h-4 w-4" />
      </button>
    </GeneralDropdown>
  );
}
