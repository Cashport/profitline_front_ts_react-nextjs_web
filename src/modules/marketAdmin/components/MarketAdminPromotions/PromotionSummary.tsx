"use client";

import { ReactNode } from "react";
import { useTranslations } from "use-intl";
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
import { PROMOTION_TYPE_LABEL_KEYS } from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/promotionLabels";
import ApprovalStatusPill from "@/components/ui/approval-status-pill";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type SummaryT = ReturnType<typeof useTranslations<"marketAdmin.promotions.summary">>;

const productLabel = (p: Pick<IPromotionDetailProduct, "sku" | "description">, t: SummaryT) =>
  [p.sku, p.description].filter(Boolean).join(" · ") || t("unnamedProduct");

const giftLabel = (item: IPromotionDetailGiftItem, t: SummaryT) =>
  item.product_id === null
    ? t("anyProductInCategory", {
        category: String(item.category_description ?? item.category_id)
      })
    : productLabel({ sku: item.sku ?? "", description: item.description ?? "" }, t);

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
  const t = useTranslations("marketAdmin.promotions.summary");
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;
  if (type === "AMOUNT") {
    return (
      <p className="text-sm text-[#141414]">
        {t.rich("minimumPurchase", {
          amount: formatCurrencyMoney(range.min_amount ?? 0),
          strong
        })}
      </p>
    );
  }

  if (!range.conditions.length && !range.product_groups.length) {
    return <p className="text-sm text-[#999999]">{t("noConditions")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {range.conditions.map((c, idx) => (
        <li key={`c${idx}`} className="text-sm text-[#141414]">
          {t.rich("conditionProduct", { qty: c.min_qty, product: productLabel(c, t), strong })}
        </li>
      ))}
      {range.product_groups.map((group) => (
        <li key={group.id} className="text-sm text-[#141414]">
          {t.rich("conditionGroup", {
            qty: group.min_qty,
            distinct:
              group.min_distinct_products && group.min_distinct_products > 1
                ? group.min_distinct_products
                : 0,
            products: group.products.map((p) => productLabel(p, t)).join(", "),
            strong
          })}
        </li>
      ))}
    </ul>
  );
}

function RangeGifts({ range }: { range: IPromotionDetailRange }) {
  const t = useTranslations("marketAdmin.promotions.summary");
  if (!range.gift_options.length) {
    return <p className="text-sm text-[#999999]">{t("noRewards")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {range.gift_options.map((option, optionIdx) => (
        <div key={option.id} className="flex flex-col gap-2">
          {range.gift_options.length > 1 && (
            <span className="text-[13px] font-semibold text-[#666666]">
              {t("option", { letter: OPTION_LETTERS[optionIdx] ?? String(option.option_number) })}
            </span>
          )}
          {option.items.map((group) => (
            <div key={group.id} className="rounded-lg border border-[#EEEEEE] px-3 py-2">
              <span className="text-[13px] text-[#999999]">
                {group.fixed
                  ? t("fixedQuantities")
                  : t("customerPicksFrom", { qty: group.max_selection_qty })}
              </span>
              <ul className="flex flex-col gap-1 mt-1">
                {group.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-[#141414]">
                    {group.fixed && <strong>{t("units", { qty: item.qty })} </strong>}
                    {giftLabel(item, t)}
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
  const t = useTranslations("marketAdmin.promotions.summary");
  const tCommon = useTranslations("common.fields");
  const tPromotionTypes = useTranslations("marketAdmin.promotionTypes");
  const limitLabel = (value: number | null) => (value ? String(value) : t("noLimit"));
  const behavior = [
    detail.is_flex === 1 && t("behavior.flex"),
    detail.take_first_eligible_range_discount === 1 && t("behavior.firstEligibleRange"),
    detail.apply_cross_selling === 0 && t("behavior.noCrossSelling"),
    detail.is_promotion_compatible_with_all_negotiations === 1 && t("behavior.compatible")
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label={tCommon("status")}>
          <StatusPill active={detail.active} />
        </Field>
        <Field label={t("approval")}>
          <ApprovalStatusPill statusId={detail.approval_entity_status_id} />
        </Field>
        <Field label={t("conditionType")}>
          {tPromotionTypes(PROMOTION_TYPE_LABEL_KEYS[detail.type])}
        </Field>
        <Field label={t("businessUnit")}>{detail.business_unit ?? t("allBusinessUnits")}</Field>
        <Field label={tCommon("startDate")}>
          <DateCell value={detail.start_date} />
        </Field>
        <Field label={tCommon("endDate")}>
          <DateCell value={detail.end_date} />
        </Field>
        <Field label={t("accumulable")}>{detail.accumulable}</Field>
        <Field label={t("behaviorLabel")}>{behavior.length ? behavior.join(" · ") : "—"}</Field>
        <Field label={t("maxUsesPerOrder")}>{limitLabel(detail.max_usage_per_order)}</Field>
        <Field label={t("maxUsesPerCustomer")}>{limitLabel(detail.max_usage_per_client)}</Field>
        <Field label={t("maxUsesPerCustomerMonth")}>
          {limitLabel(detail.max_usage_per_client_per_month)}
        </Field>
        <Field label={t("maxGlobalUses")}>{limitLabel(detail.max_global_usage)}</Field>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-[#666666]">{t("levels")}</p>
        {detail.ranges.length === 0 ? (
          <p className="text-sm text-[#999999]">{t("noLevels")}</p>
        ) : (
          detail.ranges.map((range, idx) => (
            <div key={range.id} className="rounded-lg overflow-hidden border border-[#EEEEEE]">
              <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-[#EEEEEE]">
                <span className="text-[13px] font-semibold text-[#141414]">
                  {t("level", { number: idx + 1 })}
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#EEEEEE]">
                <div className="flex flex-col gap-2 p-4 min-w-0">
                  <span className="text-[13px] font-medium text-[#666666]">{t("condition")}</span>
                  <RangeCondition range={range} type={detail.type} />
                </div>
                <div className="flex flex-col gap-2 p-4 min-w-0">
                  <span className="text-[13px] font-medium text-[#666666]">{t("rewards")}</span>
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
