import React from "react";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

import type { FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";

const FECHA_PRESETS: FilterOption[] = [
  { id: "mes_actual", name: "Mes actual" },
  { id: "ultimo_mes", name: "Último mes" },
  { id: "ultimo_trimestre", name: "Último trimestre" },
  { id: "ytd", name: "YTD" },
  { id: "ultimos_12_meses", name: "Últimos 12 meses" }
];

const CUSTOM_PREFIX = "custom:";

/**
 * Editing draft for the Fecha panel. Unlike the committed `FilterOption`, this can
 * hold a *partial* custom range so one date can be entered before the other.
 */
export type FechaDraft =
  | { mode: "preset"; option: FilterOption }
  | { mode: "custom"; from: string; to: string }
  | null;

/** Seed a draft from the committed fecha option (preset id or `custom:from:to`). */
export const fechaDraftFromOption = (opt: FilterOption | null | undefined): FechaDraft => {
  if (!opt) return null;
  if (opt.id.startsWith(CUSTOM_PREFIX)) {
    const [, from, to] = opt.id.split(":");
    return { mode: "custom", from: from ?? "", to: to ?? "" };
  }
  return { mode: "preset", option: opt };
};

/** Collapse a draft into a committable option; null until a custom range has both ends. */
export const fechaDraftToOption = (draft: FechaDraft): FilterOption | null => {
  if (!draft) return null;
  if (draft.mode === "preset") return draft.option;
  if (!draft.from || !draft.to) return null;
  const label = `${dayjs(draft.from).format("DD/MM/YYYY")} - ${dayjs(draft.to).format("DD/MM/YYYY")}`;
  return { id: `${CUSTOM_PREFIX}${draft.from}:${draft.to}`, name: label };
};

interface DateRangeTabProps {
  value: FechaDraft;
  onChange: (next: FechaDraft) => void;
}

export default function DateRangeTab({ value, onChange }: DateRangeTabProps) {
  const from = value?.mode === "custom" ? value.from : "";
  const to = value?.mode === "custom" ? value.to : "";
  const today = dayjs().format("YYYY-MM-DD");

  const setFrom = (next: string) => onChange({ mode: "custom", from: next, to });
  const setTo = (next: string) => onChange({ mode: "custom", from, to: next });

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-xs font-bold text-foreground mb-3">Periodos Predefinidos</p>
        <div className="grid grid-cols-2 gap-2">
          {FECHA_PRESETS.map((preset) => {
            const selected = value?.mode === "preset" && value.option.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ mode: "preset", option: preset })}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors text-left text-foreground ${
                  selected
                    ? "bg-primary/10 border-primary font-bold"
                    : "bg-secondary/50 hover:bg-secondary border-border"
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          Rango Personalizado
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Desde</label>
            <input
              type="date"
              value={from}
              max={to || today}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
            <input
              type="date"
              value={to}
              min={from || undefined}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
