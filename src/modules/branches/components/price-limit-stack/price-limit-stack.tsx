import type { IBranch } from "@/types/branches/IBranches";
import { cn } from "@/utils/utils";

import { formatPrice, priceListColor } from "../../utils/branches";
import PriceListBadge from "../price-list-badge/price-list-badge";

type Limits = IBranch["price_limits"];

/** Alto de cada renglón: el del chip de lista, para que lista y monto queden a la misma altura. */
const ROW = "flex h-[26px] items-center";

/** Listas de precios una debajo de otra, alineadas con `PriceLimitStack`. */
export function PriceListStack({ limits }: { limits: Limits }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {limits.map(({ list }) => (
        <div key={list} className={cn(ROW, "max-w-full")}>
          <PriceListBadge priceList={list} />
        </div>
      ))}
    </div>
  );
}

/**
 * Monto máximo por factura de cada lista, al frente de su lista. Con varias listas, cada
 * monto lleva el cuadrito del color de su lista para que se sepa a cuál pertenece.
 */
export function PriceLimitStack({
  limits,
  align = "right"
}: {
  limits: Limits;
  align?: "left" | "right";
}) {
  const several = limits.length > 1;
  return (
    <div className={cn("flex flex-col gap-1", align === "right" ? "items-end" : "items-start")}>
      {limits.map(({ list, amount }) => (
        <span
          key={list}
          title={several ? list : undefined}
          className={cn(ROW, "gap-1.5 whitespace-nowrap font-semibold tabular-nums")}
        >
          {several && (
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: priceListColor(list) }}
            />
          )}
          {formatPrice(amount)}
        </span>
      ))}
    </div>
  );
}
