"use client";

import { ReactNode } from "react";
import { formatCurrencyMoney } from "@/utils/utils";
import {
  IPromotionDetail,
  IPromotionDetailGiftItem,
  IPromotionDetailProduct,
  IPromotionDetailRange
} from "@/types/marketAdmin/IMarketAdmin";
import {
  DateCell,
  StatusPill
} from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/discountsTableConfig";
import { PROMOTION_TYPE_LABELS } from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/promotionLabels";
import ApprovalStatusPill from "@/components/ui/approval-status-pill";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const productLabel = (p: Pick<IPromotionDetailProduct, "sku" | "description">) =>
  [p.sku, p.description].filter(Boolean).join(" · ") || "Producto sin nombre";

const giftLabel = (item: IPromotionDetailGiftItem) =>
  item.product_id === null
    ? `Cualquier producto de la categoría ${item.category_description ?? item.category_id}`
    : productLabel({ sku: item.sku ?? "", description: item.description ?? "" });

const limitLabel = (value: number | null) => (value ? String(value) : "Sin límite");

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[13px] text-[#999999]">{label}</span>
      <div className="text-sm text-[#141414]">{children}</div>
    </div>
  );
}

function RangeCondition({
  range,
  type
}: {
  range: IPromotionDetailRange;
  type: IPromotionDetail["type"];
}) {
  if (type === "AMOUNT") {
    return (
      <p className="text-sm text-[#141414]">
        Compra mínima de <strong>{formatCurrencyMoney(range.min_amount ?? 0)}</strong>
      </p>
    );
  }

  if (!range.conditions.length && !range.product_groups.length) {
    return <p className="text-sm text-[#999999]">Sin condiciones</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {range.conditions.map((c, idx) => (
        <li key={`c${idx}`} className="text-sm text-[#141414]">
          <strong>{c.min_qty} und.</strong> de {productLabel(c)}
        </li>
      ))}
      {range.product_groups.map((group) => (
        <li key={group.id} className="text-sm text-[#141414]">
          <strong>{group.min_qty} und.</strong> entre{" "}
          {group.min_distinct_products && group.min_distinct_products > 1
            ? `al menos ${group.min_distinct_products} productos diferentes de: `
            : ""}
          {group.products.map(productLabel).join(", ")}
        </li>
      ))}
    </ul>
  );
}

function RangeGifts({ range }: { range: IPromotionDetailRange }) {
  if (!range.gift_options.length) {
    return <p className="text-sm text-[#999999]">Sin premios</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {range.gift_options.map((option, optionIdx) => (
        <div key={option.id} className="flex flex-col gap-2">
          {range.gift_options.length > 1 && (
            <span className="text-[13px] font-semibold text-[#666666]">
              Opción {OPTION_LETTERS[optionIdx] ?? option.option_number}
            </span>
          )}
          {option.items.map((group) => (
            <div key={group.id} className="rounded-lg border border-[#EEEEEE] px-3 py-2">
              <span className="text-[13px] text-[#999999]">
                {group.fixed
                  ? "Cantidades fijas"
                  : `El cliente elige ${group.max_selection_qty} und. entre:`}
              </span>
              <ul className="flex flex-col gap-1 mt-1">
                {group.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-[#141414]">
                    {group.fixed && <strong>{item.qty} und. </strong>}
                    {giftLabel(item)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PromotionSummary({ detail }: { detail: IPromotionDetail }) {
  const behavior = [
    detail.is_flex === 1 && "Promoción flex",
    detail.take_first_eligible_range_discount === 1 && "Toma el primer rango elegible",
    detail.apply_cross_selling === 0 && "Sin cross-selling",
    detail.is_promotion_compatible_with_all_negotiations === 1 && "Compatible con negociaciones"
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label="Estado">
          <StatusPill active={detail.active} />
        </Field>
        <Field label="Aprobación">
          <ApprovalStatusPill statusId={detail.approval_entity_status_id} />
        </Field>
        <Field label="Tipo de condición">{PROMOTION_TYPE_LABELS[detail.type]}</Field>
        <Field label="Unidad de negocio">{detail.business_unit ?? "Todas"}</Field>
        <Field label="Fecha inicio">
          <DateCell value={detail.start_date} />
        </Field>
        <Field label="Fecha fin">
          <DateCell value={detail.end_date} />
        </Field>
        <Field label="Acumulable">{detail.accumulable}</Field>
        <Field label="Comportamiento">{behavior.length ? behavior.join(" · ") : "—"}</Field>
        <Field label="Máx. usos por pedido">{limitLabel(detail.max_usage_per_order)}</Field>
        <Field label="Máx. usos por cliente">{limitLabel(detail.max_usage_per_client)}</Field>
        <Field label="Máx. usos por cliente/mes">
          {limitLabel(detail.max_usage_per_client_per_month)}
        </Field>
        <Field label="Máx. usos global">{limitLabel(detail.max_global_usage)}</Field>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-[#666666]">Niveles / escalones</p>
        {detail.ranges.length === 0 ? (
          <p className="text-sm text-[#999999]">La promoción no tiene niveles activos.</p>
        ) : (
          detail.ranges.map((range, idx) => (
            <div key={range.id} className="rounded-lg overflow-hidden border border-[#EEEEEE]">
              <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-[#EEEEEE]">
                <span className="text-[13px] font-semibold text-[#141414]">Nivel {idx + 1}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#EEEEEE]">
                <div className="flex flex-col gap-2 p-4 min-w-0">
                  <span className="text-[13px] font-medium text-[#666666]">Condición</span>
                  <RangeCondition range={range} type={detail.type} />
                </div>
                <div className="flex flex-col gap-2 p-4 min-w-0">
                  <span className="text-[13px] font-medium text-[#666666]">Premios</span>
                  <RangeGifts range={range} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
