"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { useTranslations } from "use-intl";
import { getTranslator } from "@/i18n/translator";

export type DateDraft = { from: string | null; to: string | null };

const today = () => dayjs().format("YYYY-MM-DD");
const daysAgo = (n: number) => dayjs().subtract(n, "day").format("YYYY-MM-DD");

export type DatePresetId = "hoy" | "ayer" | "ultimos_7" | "ultimos_15" | "ultimos_30" | "este_mes";

type PresetLabelKey =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last15Days"
  | "last30Days"
  | "thisMonth";

// `labelKey` is the preset name in `reverseLogistics.dateFilter.presets`.
const PRESETS: { id: DatePresetId; labelKey: PresetLabelKey; resolve: () => DateDraft }[] = [
  { id: "hoy", labelKey: "today", resolve: () => ({ from: today(), to: today() }) },
  { id: "ayer", labelKey: "yesterday", resolve: () => ({ from: daysAgo(1), to: daysAgo(1) }) },
  {
    id: "ultimos_7",
    labelKey: "last7Days",
    resolve: () => ({ from: daysAgo(7), to: today() })
  },
  {
    id: "ultimos_15",
    labelKey: "last15Days",
    resolve: () => ({ from: daysAgo(15), to: today() })
  },
  {
    id: "ultimos_30",
    labelKey: "last30Days",
    resolve: () => ({ from: daysAgo(30), to: today() })
  },
  {
    id: "este_mes",
    labelKey: "thisMonth",
    resolve: () => ({ from: dayjs().startOf("month").format("YYYY-MM-DD"), to: today() })
  }
];

// Lets callers seed a default range from the same definitions the panel uses, so
// the tag names the preset instead of falling back to raw dates.
export const resolveDatePreset = (id: DatePresetId): DateDraft =>
  PRESETS.find((preset) => preset.id === id)?.resolve() ?? { from: null, to: null };

const matchPreset = (draft: DateDraft) =>
  PRESETS.find((preset) => {
    const range = preset.resolve();
    return range.from === draft.from && range.to === draft.to;
  }) ?? null;

// A range that matches a preset is shown by name ("Últimos 30 días"); anything
// else falls back to the raw dates. Called at render time, so the name follows
// the active language.
export const formatDateTagValue = (draft: DateDraft): string => {
  const preset = matchPreset(draft);
  if (preset) return getTranslator("reverseLogistics")(`dateFilter.presets.${preset.labelKey}`);
  return draft.from && draft.to ? `${draft.from} - ${draft.to}` : draft.from || draft.to || "";
};

interface FilterDateTabProps {
  value: DateDraft;
  onChange: (next: DateDraft) => void;
}

// Custom panel rendered inside FilterModal for the "Fecha" category of both
// tabs — /visits and /approvals take the same fromDate/toDate range.
export function FilterDateTab({ value, onChange }: FilterDateTabProps) {
  const t = useTranslations("reverseLogistics.dateFilter");
  // Resolve each preset's concrete range once so applying and highlighting compare
  // the same values.
  const presets = useMemo(
    () => PRESETS.map((p) => ({ id: p.id, labelKey: p.labelKey, range: p.resolve() })),
    []
  );

  const isSelected = (range: DateDraft) => value.from === range.from && value.to === range.to;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-[13px] font-bold text-foreground mb-3">{t("presetPeriods")}</p>
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
                {t(`presets.${preset.labelKey}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {t("customRange")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] text-muted-foreground mb-1 block">{t("from")}</label>
            <input
              type="date"
              value={value.from || ""}
              onChange={(e) => onChange({ ...value, from: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[13px] text-muted-foreground mb-1 block">{t("to")}</label>
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
