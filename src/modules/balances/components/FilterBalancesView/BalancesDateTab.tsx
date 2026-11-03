import React from "react";
import { Calendar } from "lucide-react";
import { useTranslations } from "use-intl";

export type DateDraft = { from_date: string | null; to_date: string | null };

/** `name` es la clave en `balances.dateTab.presets`. */
const DATE_PRESETS = [
  { id: "mes_actual", name: "currentMonth" },
  { id: "ultimo_mes", name: "lastMonth" },
  { id: "ultimo_trimestre", name: "lastQuarter" },
  { id: "ytd", name: "ytd" },
  { id: "ultimos_12_meses", name: "last12Months" }
] as const;

const toISODate = (date: Date | null) => (date ? date.toISOString().split("T")[0] : null);

const presetRange = (presetId: string): DateDraft => {
  const now = new Date();
  let from: Date | null = null;
  let to: Date | null = null;

  if (presetId === "mes_actual") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = now;
  } else if (presetId === "ultimo_mes") {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    to = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (presetId === "ultimo_trimestre") {
    from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    to = now;
  } else if (presetId === "ytd") {
    from = new Date(now.getFullYear(), 0, 1);
    to = now;
  } else if (presetId === "ultimos_12_meses") {
    from = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    to = now;
  }

  return { from_date: toISODate(from), to_date: toISODate(to) };
};

interface BalancesDateTabProps {
  value: DateDraft;
  onChange: (next: DateDraft) => void;
}

export default function BalancesDateTab({ value, onChange }: BalancesDateTabProps) {
  const t = useTranslations("balances.dateTab");
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-[13px] font-bold text-foreground mb-3">{t("presetsTitle")}</p>
        <div className="grid grid-cols-2 gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(presetRange(preset.id))}
              className="px-3 py-2 text-sm bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors text-left"
            >
              {t(`presets.${preset.name}`)}
            </button>
          ))}
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
              value={value.from_date || ""}
              onChange={(e) => onChange({ ...value, from_date: e.target.value || null })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[13px] text-muted-foreground mb-1 block">{t("to")}</label>
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
