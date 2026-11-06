"use client";

import { TierSwatch } from "./TierBadge";
import { TIER_CODES, TIER_META, TierCode } from "./tiers";

interface TierSelectorProps {
  value: TierCode | null;
  onChange: (value: TierCode | null) => void;
  disabled?: boolean;
}

/** Segmented control to pick the client tier (Oro / Plata / Bronce / Sin clasificar). */
export function TierSelector({ value, onChange, disabled }: TierSelectorProps) {
  const options: Array<TierCode | null> = [...TIER_CODES, null];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#141414]">Clasificación</span>
      <div role="radiogroup" className="grid grid-cols-4 gap-1.5">
        {options.map((code) => {
          const on = value === code;
          return (
            <button
              key={code ?? "NONE"}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(code)}
              className="flex h-9 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                border: `1px solid ${on ? "#cbe71e" : "#e3e3e3"}`,
                background: on ? "#f7f7f7" : "#ffffff",
                color: on ? "#141414" : "#4a4a4a",
                fontWeight: on ? 600 : 500
              }}
            >
              <TierSwatch code={code ?? "NONE"} size={10} />
              {TIER_META[code ?? "NONE"].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
