import { causalColor } from "../../utils/causales";

// Causal pill colored from the backend `RGB`. Same tinted-with-border idiom as
// `atoms/Tag`: the hex drives text + border, and the background is that hex at
// 8% alpha ("14" suffix) so any color the backend sends stays readable.
export function CausalBadge({ label, rgb }: { label: string; rgb?: string }) {
  const color = causalColor(rgb);
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs leading-snug"
      style={{ color, border: `1px solid ${color}`, backgroundColor: `${color}14` }}
      title={label}
    >
      {label}
    </span>
  );
}
