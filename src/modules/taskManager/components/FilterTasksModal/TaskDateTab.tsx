import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export type DateDraft = { from_date: string | null; to_date: string | null };

const FMT = "YYYY-MM-DD";

// The 6 quick presets ported from the legacy FiltersTasks cascader so we keep parity.
const DATE_PRESETS: { id: string; name: string; range: () => DateDraft }[] = [
  {
    id: "ultimos_7_dias",
    name: "Últimos 7 días",
    range: () => ({
      from_date: dayjs().subtract(7, "day").format(FMT),
      to_date: dayjs().format(FMT)
    })
  },
  {
    id: "ultimos_30_dias",
    name: "Últimos 30 días",
    range: () => ({
      from_date: dayjs().subtract(30, "day").format(FMT),
      to_date: dayjs().format(FMT)
    })
  },
  {
    id: "este_mes",
    name: "Este mes",
    range: () => ({
      from_date: dayjs().startOf("month").format(FMT),
      to_date: dayjs().endOf("month").format(FMT)
    })
  },
  {
    id: "este_trimestre",
    name: "Este trimestre",
    range: () => ({
      from_date: dayjs()
        .utc()
        .startOf("month")
        .subtract(dayjs().utc().month() % 3, "month")
        .startOf("month")
        .format(FMT),
      to_date: dayjs()
        .utc()
        .startOf("month")
        .add(3 - (dayjs().utc().month() % 3), "month")
        .subtract(1, "day")
        .format(FMT)
    })
  },
  {
    id: "este_ano",
    name: "Este año",
    range: () => ({
      from_date: dayjs().utc().startOf("year").format(FMT),
      to_date: dayjs().utc().endOf("year").format(FMT)
    })
  },
  {
    id: "trimestre_pasado",
    name: "Trimestre pasado",
    range: () => {
      const currentMonth = dayjs().utc().month();
      const startMonth = currentMonth - (currentMonth % 3) - 3;
      const year = startMonth < 0 ? dayjs().utc().year() - 1 : dayjs().utc().year();
      const adjustedStartMonth = (startMonth + 12) % 12;
      const startDate = dayjs().utc().year(year).month(adjustedStartMonth).startOf("month");
      const endDate = startDate.add(2, "month").endOf("month");

      return { from_date: startDate.format(FMT), to_date: endDate.format(FMT) };
    }
  }
];

interface TaskDateTabProps {
  value: DateDraft;
  onChange: (next: DateDraft) => void;
}

export default function TaskDateTab({ value, onChange }: TaskDateTabProps) {
  // Resolve each preset's concrete range once so we can both apply and highlight the active one.
  const presets = useMemo(
    () => DATE_PRESETS.map((p) => ({ id: p.id, name: p.name, range: p.range() })),
    []
  );

  const isSelected = (range: DateDraft) =>
    value.from_date === range.from_date && value.to_date === range.to_date;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-xs font-bold text-foreground mb-3">Periodos Predefinidos</p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const selected = isSelected(preset.range);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.range)}
                aria-pressed={selected}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors text-left ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
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
              value={value.from_date || ""}
              onChange={(e) => onChange({ ...value, from_date: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
            <input
              type="date"
              value={value.to_date || ""}
              onChange={(e) => onChange({ ...value, to_date: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
