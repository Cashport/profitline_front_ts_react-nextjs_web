"use client";

import { cn } from "@/utils/utils";
import { IClientTier, TIER_META, TierFilterCode } from "./tiers";

interface TierSwatchProps {
  code: TierFilterCode;
  /** 8px like the market legend (default) or 10px for selectors. */
  size?: 8 | 10;
  className?: string;
}

/** Flat color dot, same as the process tags and market legend. */
export function TierSwatch({ code, size = 8, className }: TierSwatchProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size, background: TIER_META[code].color }}
    />
  );
}

interface TierBadgeProps {
  tier?: IClientTier | null;
  /** Show "Sin clasificar" when the client has no tier (otherwise renders nothing). */
  showEmpty?: boolean;
  className?: string;
}

/** Dot + text (13px), quiet enough to sit in any table cell. */
export function TierBadge({ tier, showEmpty = false, className }: TierBadgeProps) {
  const code: TierFilterCode | null = tier?.code ?? (showEmpty ? "NONE" : null);
  if (!code) return null;
  const label = tier?.name ?? TIER_META[code].label;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px]",
        code === "NONE" ? "text-[#8a8a8a]" : "text-[#141414]",
        className
      )}
    >
      <TierSwatch code={code} />
      {label}
    </span>
  );
}
