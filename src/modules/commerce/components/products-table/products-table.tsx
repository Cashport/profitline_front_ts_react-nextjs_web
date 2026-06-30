"use client";

import { useState } from "react";
import { Gift, Pencil, Trash2 } from "lucide-react";

export function formatPrice(n: number) {
  return "$" + (n ?? 0).toLocaleString("es-CO");
}

function DescuentoCell({
  value,
  max,
  onChange
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const enabled = max > 0;

  if (!enabled) {
    return <span className="text-xs text-[#999999] italic">Sin desc.</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min={0}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const n = parseInt(draft);
              if (!isNaN(n) && n >= 0 && n <= max) onChange(n);
              else setDraft(String(value));
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraft(String(value));
                setEditing(false);
              }
            }}
            className="w-12 text-center text-xs font-semibold border border-[#141414] rounded px-1 py-0.5 outline-none bg-white"
          />
          <span className="text-xs text-[#666666]">%</span>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="flex items-center gap-0.5 text-xs font-semibold text-red-500 hover:underline"
        >
          -{value}%
          <Pencil size={10} className="text-[#999999]" />
        </button>
      )}
    </div>
  );
}

export interface ProductsTableRow {
  key: string;
  description: string;
  sku: string;
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  /** Discount percentage shown (and edited, when `onDiscountChange` is provided). */
  discountPct: number;
  /** Editable upper bound; `<= 0` renders "Sin desc.". Only relevant in editable mode. */
  maxDiscountPct?: number;
  /** Remaining quantity to assign — only rendered when `multiEntrega`. */
  restante?: number;
  /** Provide to render an editable discount cell; omit for a read-only cell. */
  onDiscountChange?: (v: number) => void;
  /** Provide to allow removing the row; the trash button shows only when `finalPrice === 0`. */
  onRemove?: () => void;
}

export interface ProductsTableCategory {
  key: string | number;
  name: string;
  rows: ProductsTableRow[];
}

export interface ProductsTableBonusItem {
  key: string;
  description: string;
  qty: number;
  fixed: boolean;
  onRemove?: () => void;
}

export interface ProductsTableProps {
  categories: ProductsTableCategory[];
  totalCantidad: number;
  totalMonto: number;
  /** Adds the "Rest." column and renders each row's `restante`. */
  multiEntrega?: boolean;
  /** Renders the "Productos bonificados" section when non-empty. */
  bonusItems?: ProductsTableBonusItem[];
  /** Adds the trailing action column (trash buttons). */
  showActionsColumn?: boolean;
  /** Sizing/positioning classes merged onto the outer container. */
  className?: string;
}

export default function ProductsTable({
  categories,
  totalCantidad,
  totalMonto,
  multiEntrega = false,
  bonusItems = [],
  showActionsColumn = false,
  className = ""
}: ProductsTableProps) {
  // Built as an inline style (not a Tailwind `grid-cols-[…]` class) because the column
  // count is dynamic and Tailwind can't JIT a runtime-concatenated arbitrary value.
  const gridTemplateColumns = [
    "2fr",
    "90px",
    "100px",
    "120px",
    "100px",
    "70px",
    "110px",
    ...(multiEntrega ? ["56px"] : []),
    ...(showActionsColumn ? ["32px"] : [])
  ].join(" ");

  const showBonus = bonusItems.length > 0;

  return (
    <div
      className={`rounded-xl border border-[#EEEEEE] overflow-x-auto overflow-y-hidden ${className}`}
    >
      <div className="min-w-max h-full flex flex-col">
        {/* Table header */}
        <div
          className="grid px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE] rounded-t-xl flex-shrink-0"
          style={{ gridTemplateColumns }}
        >
          <span className="text-xs font-medium text-[#AAAAAA]">Producto</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">SKU</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">P. Original</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-center">Descuento</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">P. Final</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">Cant.</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">Total</span>
          {multiEntrega && (
            <span className="text-xs font-medium text-[#AAAAAA] text-right">Rest.</span>
          )}
          {showActionsColumn && <span />}
        </div>

        {/* Rows */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {categories.map((category, gIdx) => (
            <div key={category.key} className={gIdx > 0 ? "border-t border-[#EEEEEE]" : ""}>
              {/* Category label */}
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold text-[#AAAAAA] uppercase tracking-widest">
                  {category.name}
                </span>
              </div>

              {category.rows.map((row) => {
                const totalLinea = row.finalPrice * row.quantity;
                return (
                  <div
                    key={row.key}
                    className="grid items-center px-4 py-2.5"
                    style={{ gridTemplateColumns }}
                  >
                    <p
                      className="text-sm font-medium text-[#141414] leading-tight pr-4 truncate"
                      title={row.description}
                    >
                      {row.description}
                    </p>
                    <p className="text-xs text-[#CCCCCC] text-right">{row.sku}</p>
                    <p className="text-xs text-[#CCCCCC] line-through text-right">
                      {formatPrice(row.originalPrice)}
                    </p>
                    <div className="flex justify-center">
                      {row.onDiscountChange ? (
                        <DescuentoCell
                          value={row.discountPct}
                          max={row.maxDiscountPct ?? 0}
                          onChange={row.onDiscountChange}
                        />
                      ) : row.discountPct > 0 ? (
                        <span className="text-xs font-semibold text-red-500">
                          -{row.discountPct}%
                        </span>
                      ) : (
                        <span className="text-xs text-[#999999] italic">Sin desc.</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#141414] text-right">
                      {formatPrice(row.finalPrice)}
                    </p>
                    <p className="text-sm text-[#141414] text-right">{row.quantity}</p>
                    <p className="text-sm font-semibold text-[#141414] text-right">
                      {formatPrice(totalLinea)}
                    </p>
                    {multiEntrega && (
                      <p
                        className={`text-sm font-bold text-right ${
                          row.restante === 0
                            ? "text-green-600"
                            : (row.restante ?? 0) < 0
                              ? "text-red-500"
                              : "text-amber-500"
                        }`}
                        title={String(row.restante ?? 0)}
                      >
                        {row.restante}
                      </p>
                    )}
                    {showActionsColumn ? (
                      row.onRemove && row.finalPrice === 0 ? (
                        <button
                          onClick={row.onRemove}
                          title="Eliminar producto"
                          className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 justify-self-end"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <span />
                      )
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Sección bonificados */}
          {showBonus && (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-[#F7FDE8] border-t border-[#EEEEEE]">
                <Gift size={12} className="text-[#6AB000] flex-shrink-0" />
                <span className="text-[11px] font-semibold text-[#6AB000] uppercase tracking-wide">
                  Productos bonificados
                </span>
              </div>

              {bonusItems.map((b, idx) => (
                <div
                  key={b.key}
                  className={`grid items-center px-4 py-3.5 bg-[#FDFFF5] ${
                    idx < bonusItems.length - 1 ? "border-b border-[#F0F9D8]" : ""
                  }`}
                  style={{ gridTemplateColumns }}
                >
                  <div className="flex items-center gap-2 pr-4 min-w-0">
                    <p className="text-sm font-medium text-[#141414] truncate">{b.description}</p>
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        b.fixed ? "bg-[#E8F5C0] text-[#4A7A00]" : "bg-[#EEF4FF] text-[#3B5BDB]"
                      }`}
                    >
                      {b.fixed ? "Promo auto" : "Manual"}
                    </span>
                  </div>
                  <span />
                  <span />
                  <div className="flex justify-center">
                    <span className="text-xs font-semibold text-[#6AB000]">100% desc.</span>
                  </div>
                  <p className="text-sm font-semibold text-[#6AB000] text-right">
                    {formatPrice(0)}
                  </p>
                  <p className="text-sm text-[#141414] text-right">{b.qty}</p>
                  <p className="text-sm font-semibold text-[#6AB000] text-right">
                    {formatPrice(0)}
                  </p>
                  {multiEntrega && <span />}
                  {showActionsColumn &&
                    (b.onRemove ? (
                      <button
                        onClick={b.onRemove}
                        title="Quitar bonificado"
                        className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 justify-self-end"
                      >
                        <Trash2 size={12} />
                      </button>
                    ) : (
                      <span />
                    ))}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Totals row */}
        <div
          className="grid items-center px-4 py-3 bg-[#FAFAFA] border-t border-[#EEEEEE] rounded-b-xl flex-shrink-0"
          style={{ gridTemplateColumns }}
        >
          <span className="text-xs font-semibold text-[#141414]">Totales</span>
          <span />
          <span />
          <span />
          <span />
          <span className="text-sm font-bold text-[#141414] text-right">{totalCantidad}</span>
          <span className="text-sm font-bold text-[#141414] text-right">
            {formatPrice(totalMonto)}
          </span>
          {multiEntrega && <span />}
          {showActionsColumn && <span />}
        </div>
      </div>
    </div>
  );
}
