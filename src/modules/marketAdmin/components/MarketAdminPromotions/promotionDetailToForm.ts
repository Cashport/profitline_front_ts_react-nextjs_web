import {
  ICreatePromotionBody,
  INivel,
  IPromocion,
  IPromotionDetail
} from "@/types/marketAdmin/IMarketAdmin";
import { buildPromotionPayload } from "./buildPromotionPayload";

const toOptional = (value: number | null) => (value === null ? undefined : value);

// The form has no editor for category gifts; editing would drop them.
export const hasCategoryGifts = (detail: IPromotionDetail) =>
  detail.ranges.some((range) =>
    range.gift_options.some((option) =>
      option.items.some((group) => group.items.some((item) => item.product_id === null))
    )
  );

export const promotionDetailToForm = (detail: IPromotionDetail): IPromocion => ({
  id: String(detail.id),
  nombre: detail.name,
  tipoCondicion: detail.type === "AMOUNT" ? "monto" : "combinacion",
  activa: detail.active === 1,
  fechaInicio: detail.start_date?.slice(0, 10) ?? "",
  fechaFin: detail.end_date?.slice(0, 10) ?? "",
  accumulable: detail.accumulable,
  maxUsagePerOrder: toOptional(detail.max_usage_per_order),
  maxUsagePerClient: toOptional(detail.max_usage_per_client),
  maxUsagePerClientPerMonth: toOptional(detail.max_usage_per_client_per_month),
  maxGlobalUsage: toOptional(detail.max_global_usage),
  businessUnit: detail.business_unit ?? undefined,
  isFlex: detail.is_flex === 1,
  takeFirstEligibleRangeDiscount: detail.take_first_eligible_range_discount === 1,
  applyCrossSelling: detail.apply_cross_selling !== 0,
  isPromotionCompatibleWithAllNegotiations:
    detail.is_promotion_compatible_with_all_negotiations === 1,
  niveles: detail.ranges.map((range): INivel => {
    const singleGroups = range.product_groups.filter(
      (group) => group.product_ids.length === 1 && (group.min_distinct_products ?? 1) <= 1
    );
    const packageGroups = range.product_groups.filter((group) => !singleGroups.includes(group));

    return {
      id: `n${range.id}`,
      montoMinimo: range.min_amount ?? 0,
      productosCondicion: [
        ...range.conditions.map((condition, idx) => ({
          id: `pc${range.id}_c${idx}`,
          productId: condition.product_id,
          cantidad: condition.min_qty
        })),
        ...singleGroups.map((group) => ({
          id: `pc${range.id}_g${group.id}`,
          productId: group.product_ids[0],
          cantidad: group.min_qty
        }))
      ],
      paquetesCondicion: packageGroups.map((group) => ({
        id: `pk${group.id}`,
        unidades: group.min_qty,
        minProductos: group.min_distinct_products ?? 1,
        productos: group.product_ids.map((productId, idx) => ({
          id: `pk${group.id}_${idx}`,
          productId
        }))
      })),
      premios: range.gift_options.map((option) => ({
        id: `pr${option.id}`,
        grupos: option.items.map((group) => {
          const items = group.items.filter((item) => item.product_id !== null);
          const productos = items.map((item, idx) => ({
            id: `pp${group.id}_${idx}`,
            productId: item.product_id as number
          }));
          return {
            id: `g${group.id}`,
            productos,
            modo: group.fixed ? ("fijo" as const) : ("pool" as const),
            cantidadesFijas: group.fixed
              ? Object.fromEntries(productos.map((p, idx) => [p.id, items[idx].qty]))
              : undefined,
            unidadesPool: group.fixed ? undefined : group.max_selection_qty
          };
        })
      }))
    };
  })
});

// Keeps the fields the form does not edit (customer/channel/zone restrictions).
export const buildPromotionUpdatePayload = (
  promo: IPromocion,
  detail: IPromotionDetail
): ICreatePromotionBody => ({
  ...buildPromotionPayload(promo),
  end_date: promo.fechaFin ? `${promo.fechaFin} 23:59:59` : undefined,
  restricted_customer_id: detail.restricted_customer_id ?? undefined,
  restricted_channel_id: toOptional(detail.restricted_channel_id),
  restricted_zone_id: toOptional(detail.restricted_zone_id)
});
