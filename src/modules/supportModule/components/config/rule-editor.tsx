"use client";

import { InputNumber, Select } from "antd";

import type { SupportCriticality } from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import { CRITICALITY_META, CRITICALITY_ORDER, formatDuration } from "../../utils/support-format";

export interface RuleDraft {
  criticality: SupportCriticality | null;
  attention: number | null;
  resolution: number | null;
  owner: number | null;
}

type Unit = "min" | "h";

export const toMinutes = (value: number | null, unit: Unit) =>
  value == null ? null : Math.round(unit === "h" ? value * 60 : value);

export const DrawerLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[13px] font-semibold">{children}</span>
    {hint && <span className="text-[13px] text-cp-ink-3">{hint}</span>}
  </div>
);

export function CriticalityPicker({
  value,
  onChange,
  allowInherit,
  inheritedValue
}: {
  value: SupportCriticality | null;
  onChange: (v: SupportCriticality | null) => void;
  allowInherit?: boolean;
  inheritedValue?: SupportCriticality | null;
}) {
  const opts: (SupportCriticality | null)[] = [
    ...(allowInherit ? [null] : []),
    ...CRITICALITY_ORDER
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => {
        const on = value === o;
        return (
          <button
            key={o ?? "inherit"}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border bg-cp-surface px-2.5 text-[13px]",
              on ? "border-cp-ink font-semibold" : "border-cp-line-2"
            )}
          >
            {o && (
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: CRITICALITY_META[o].color }}
              />
            )}
            {o
              ? CRITICALITY_META[o].label
              : `Heredar${inheritedValue ? ` (${CRITICALITY_META[inheritedValue].label})` : ""}`}
          </button>
        );
      })}
    </div>
  );
}

function DurationInput({
  label,
  minutes,
  onChange,
  error
}: {
  label: string;
  minutes: number | null;
  onChange: (m: number | null) => void;
  error?: boolean;
}) {
  const unit: Unit = minutes != null && minutes >= 60 && minutes % 60 === 0 ? "h" : "min";
  const shown = minutes == null ? null : unit === "h" ? minutes / 60 : minutes;
  return (
    <div className="flex items-center gap-2">
      <span className="w-[130px] shrink-0 text-[13px] text-cp-ink-2">{label}</span>
      <InputNumber
        min={1}
        value={shown}
        status={error ? "error" : undefined}
        onChange={(v) => onChange(toMinutes(v == null ? null : Number(v), unit))}
        className="w-[96px]"
      />
      <Select
        value={unit}
        className="w-[110px]"
        onChange={(u: Unit) => onChange(shown == null ? null : toMinutes(shown, u))}
        options={[
          { value: "min", label: "minutos" },
          { value: "h", label: "horas" }
        ]}
      />
    </div>
  );
}

/** ANS: solución obligatoria; atención opcional ("dividir"). Horas hábiles del proyecto. */
export function SlaEditor({
  attention,
  resolution,
  onChange,
  showErrors
}: {
  attention: number | null;
  resolution: number | null;
  onChange: (next: { attention: number | null; resolution: number | null }) => void;
  showErrors?: boolean;
}) {
  const split = attention != null;
  return (
    <div className="flex flex-col gap-2">
      {split && (
        <DurationInput
          label="Primera atención"
          minutes={attention}
          onChange={(m) => onChange({ attention: m, resolution })}
          error={showErrors && attention != null && resolution != null && attention > resolution}
        />
      )}
      <DurationInput
        label="Solución"
        minutes={resolution}
        onChange={(m) => onChange({ attention, resolution: m })}
        error={showErrors && resolution == null}
      />
      <button
        type="button"
        onClick={() => onChange({ attention: split ? null : 15, resolution })}
        className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] text-cp-blue"
      >
        {split ? "Quitar ANS de primera atención" : "+ Agregar ANS de primera atención"}
      </button>
      <span className="text-[13px] text-cp-ink-3">
        Se mide en horas hábiles del proyecto. La atención se cumple cuando alguien pasa el ticket a
        «En progreso».
      </span>
    </div>
  );
}

export const slaText = (attention: number | null, resolution: number | null) =>
  resolution == null
    ? "—"
    : attention != null
      ? `${formatDuration(attention)} / ${formatDuration(resolution)}`
      : formatDuration(resolution);
