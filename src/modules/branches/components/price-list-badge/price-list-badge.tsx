import { priceListColor } from "../../utils/branches";

/** Chip teñido con el color de su lista de precios: fondo suave y cuadrito sólido. */
export default function PriceListBadge({ priceList }: { priceList: string }) {
  const color = priceListColor(priceList);
  return (
    <span
      title={priceList}
      className="inline-flex h-[26px] max-w-full items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-medium text-cp-ink"
      // #rrggbb + "1f" ≈ 12% de opacidad, como los tintes de estado del resto de la app.
      style={{ background: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}33` }}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{ background: color }}
      />
      <span className="truncate">{priceList}</span>
    </span>
  );
}
