"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

export type DateDraft = { from_date: string | null; to_date: string | null };

const FMT = "YYYY-MM-DD";
const day = (d: dayjs.Dayjs) => d.format(FMT);

/** Periodos estándar de fecha (DESIGN.md §6), iguales en todos los módulos. */
const PERIODS: { id: string; name: string; range: (today: dayjs.Dayjs) => DateDraft }[] = [
  { id: "hoy", name: "Hoy", range: (t) => ({ from_date: day(t), to_date: day(t) }) },
  {
    id: "esta_semana",
    name: "Esta semana",
    range: (t) => {
      const monday = t.subtract((t.day() + 6) % 7, "day");
      return { from_date: day(monday), to_date: day(monday.add(6, "day")) };
    }
  },
  {
    id: "mes_actual",
    name: "Mes actual",
    range: (t) => ({ from_date: day(t.startOf("month")), to_date: day(t.endOf("month")) })
  },
  {
    id: "ultimo_mes",
    name: "Último mes",
    range: (t) => {
      const prev = t.subtract(1, "month");
      return { from_date: day(prev.startOf("month")), to_date: day(prev.endOf("month")) };
    }
  },
  {
    id: "ultimo_trimestre",
    name: "Último trimestre",
    range: (t) => ({ from_date: day(t.subtract(3, "month")), to_date: day(t) })
  },
  {
    id: "ytd",
    name: "YTD",
    range: (t) => ({ from_date: day(t.startOf("year")), to_date: day(t) })
  },
  {
    id: "ultimos_12_meses",
    name: "Últimos 12 meses",
    range: (t) => ({ from_date: day(t.subtract(12, "month")), to_date: day(t) })
  }
];

interface TasksDateTabProps {
  value: DateDraft;
  onChange: (next: DateDraft) => void;
}

/** Panel "Fecha" de Filtros Avanzados: periodos estándar + rango personalizado (creación). */
export default function TasksDateTab({ value, onChange }: TasksDateTabProps) {
  const periods = useMemo(() => {
    const today = dayjs();
    return PERIODS.map((p) => ({ id: p.id, name: p.name, range: p.range(today) }));
  }, []);
  const today = dayjs().format(FMT);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="mb-3 text-[13px] font-bold text-foreground">Periodos predefinidos</p>
        <div className="grid grid-cols-2 gap-2">
          {periods.map((period) => {
            const selected =
              value.from_date === period.range.from_date && value.to_date === period.range.to_date;
            return (
              <button
                key={period.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(period.range)}
                className={`rounded-lg border px-3 py-2 text-left text-sm text-foreground transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border bg-secondary/50 hover:bg-secondary"
                }`}
              >
                {period.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-foreground">
          <Calendar className="h-3 w-3" />
          Rango personalizado
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Desde</label>
            <input
              type="date"
              value={value.from_date || ""}
              max={value.to_date || today}
              onChange={(e) => onChange({ ...value, from_date: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground [color-scheme:light] focus:outline-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-muted-foreground">Hasta</label>
            <input
              type="date"
              value={value.to_date || ""}
              min={value.from_date || undefined}
              onChange={(e) => onChange({ ...value, to_date: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground [color-scheme:light] focus:outline-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
