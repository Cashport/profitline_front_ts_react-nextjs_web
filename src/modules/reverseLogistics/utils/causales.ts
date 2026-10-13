import { IProfit360Causal } from "@/types/reverseLogistics/IReverseLogistics";

// Neutral gray-500 used when the backend sends no usable color.
const FALLBACK_COLOR = "#6B7280";

const HEX_RE = /^([0-9a-f]{3}|[0-9a-f]{6})$/i;

// Profit360 ships causales as a JSON *string* on both the visits and the
// approvals endpoints:
//   {"Causales":[{"Id":"…","causal":"Vencimiento","RGB":"32417A"}]}
// Anything malformed degrades to an empty list — this never throws.
export function parseCausales(raw: string | null | undefined): IProfit360Causal[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const list = (parsed as { Causales?: unknown })?.Causales;
  if (!Array.isArray(list)) return [];

  return list
    .filter(
      (item): item is Partial<IProfit360Causal> =>
        typeof (item as Partial<IProfit360Causal>)?.causal === "string" &&
        (item as IProfit360Causal).causal.trim() !== ""
    )
    .map((item) => ({
      Id: item.Id ?? "",
      causal: item.causal as string,
      RGB: item.RGB ?? ""
    }));
}

// `RGB` arrives as a bare hex string ("32417A"), but sibling fields like
// `ColorCausal` already include the "#" — accept both and fall back to gray
// rather than emitting an invalid CSS color.
export function causalColor(rgb: string | undefined): string {
  const cleaned = (rgb ?? "").trim().replace(/^#/, "");
  return HEX_RE.test(cleaned) ? `#${cleaned}` : FALLBACK_COLOR;
}
