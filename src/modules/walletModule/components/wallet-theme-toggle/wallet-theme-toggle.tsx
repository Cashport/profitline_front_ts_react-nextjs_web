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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
      >
        <TriggerIcon className="h-4 w-4" />
      </button>
    </GeneralDropdown>
  );
}
