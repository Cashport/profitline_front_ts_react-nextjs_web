"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";

import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";
import { useTheme } from "@/modules/commerce/contexts/theme-context";

const THEME_OPTIONS: { key: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
  { key: "light", label: "Claro", Icon: Sun },
  { key: "dark", label: "Oscuro", Icon: Moon },
  { key: "system", label: "Sistema", Icon: Laptop }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const TriggerIcon = THEME_OPTIONS.find((o) => o.key === theme)?.Icon ?? Sun;

  const items: DropdownItem[] = THEME_OPTIONS.map(({ key, label, Icon }) => ({
    key,
    icon: <Icon className="w-4 h-4" />,
    label: (
      <span className={theme === key ? "text-primary font-semibold" : "text-foreground"}>
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
        className="shrink-0 flex items-center justify-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-foreground hover:bg-secondary transition-colors shadow-sm"
      >
        <TriggerIcon className="w-4 h-4" />
      </button>
    </GeneralDropdown>
  );
}
