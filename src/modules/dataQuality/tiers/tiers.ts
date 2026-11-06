export type TierCode = "GOLD" | "SILVER" | "BRONZE";
export type TierFilterCode = TierCode | "NONE";

export const TIER_CODES: TierCode[] = ["GOLD", "SILVER", "BRONZE"];

export interface IClientTier {
  code: TierCode;
  name: string;
  color: string;
}

export interface ITierOption {
  code: TierFilterCode;
  name: string;
  color: string | null;
  count: number;
}

export interface ITierBreakdown {
  code: TierFilterCode;
  clients: number;
  active_alerts: number;
  monthly_ingestion_percentage: number | null;
}

interface TierMeta {
  label: string;
  /** Solid, flat color (DESIGN.md: never pastel, no gradients). */
  color: string;
  /** Text color on top of the solid color. */
  ink: string;
}

export const TIER_META: Record<TierFilterCode, TierMeta> = {
  GOLD: { label: "Oro", color: "#E8B004", ink: "#141414" },
  SILVER: { label: "Plata", color: "#A3ADB8", ink: "#141414" },
  BRONZE: { label: "Bronce", color: "#C0703A", ink: "#141414" },
  NONE: { label: "Sin clasificar", color: "#8A8A8A", ink: "#ffffff" }
};

export const isTierCode = (value: unknown): value is TierCode =>
  typeof value === "string" && (TIER_CODES as string[]).includes(value);

/** `tier=GOLD,SILVER` query fragment (empty string when nothing is selected). */
export const tierQueryParam = (codes: TierFilterCode[]): string =>
  codes.length ? `tier=${codes.join(",")}` : "";

export const appendTierParam = (url: string, codes: TierFilterCode[]): string => {
  const param = tierQueryParam(codes);
  if (!param) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${param}`;
};
