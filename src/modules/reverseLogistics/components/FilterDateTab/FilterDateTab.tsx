"use client";

import dayjs from "dayjs";
import { Calendar } from "lucide-react";

export type DateDraft = { from: string | null; to: string | null };

const today = () => dayjs().format("YYYY-MM-DD");
const daysAgo = (n: number) => dayjs().subtract(n, "day").format("YYYY-MM-DD");

const PRESETS: { id: string; name: string; resolve: () => DateDraft }[] = [
  { id: "hoy", name: "Hoy", resolve: () => ({ from: today(), to: today() }) },
  { id: "ayer", name: "Ayer", resolve: () => ({ from: daysAgo(1), to: daysAgo(1) }) },
  { id: "ultimos_7", name: "Últimos 7 días", resolve: () => ({ from: daysAgo(7), to: today() }) },
  { id: "ultimos_15", name: "Últimos 15 días", resolve: () => ({ from: daysAgo(15), to: today() }) },
  { id: "ultimos_30", name: "Últimos 30 días", resolve: () => ({ from: daysAgo(30), to: today() }) },
  {
    id: "este_mes",
    name: "Este mes",
    resolve: () => ({ from: dayjs().startOf("month").format("YYYY-MM-DD"), to: today() })
  }
];

interface FilterDateTabProps {
  value: DateDraft;
  onChange: (next: DateDraft) => void;
}

// Custom panel rendered inside FilterModal for the "Fecha" category of both
// tabs — /visits and /approvals take the same fromDate/toDate range.
export function FilterDateTab({ value, onChange }: FilterDateTabProps) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-xs font-bold text-foreground mb-3">Periodos Predefinidos</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.resolve())}
              className="px-3 py-2 text-sm bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors text-left"
            >
              {preset.name}
            </button>
          ))}
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
              value={value.from || ""}
              onChange={(e) => onChange({ ...value, from: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
            <input
              type="date"
              value={value.to || ""}
              onChange={(e) => onChange({ ...value, to: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
