import { IBonus, IOtherBonificatedProduct, IPromotion } from "@/types/commerce/ICommerce";

/**
 * Reconstruye el estado `IBonus` desde el `promotion` guardado en un borrador.
 * Contraparte de `handleConfirm` (modal-bonus): mapea
 * `active_range.gift_options[].items` (grupos fixed/pool) a `bonusOptions[].cards`,
 * tomando la cantidad elegida del propio `qty` de cada item del borrador
 * (única fuente de las selecciones en la respuesta del draft). Descarta items
 * con qty 0.
 */
export const buildBonusFromPromotion = (
  promotion?: IPromotion,
  otherBonificatedProducts?: IOtherBonificatedProduct[]
): IBonus | undefined => {
  if (!promotion) return undefined;

  const cards = (promotion.active_range?.gift_options ?? []).flatMap((option) =>
    option.items
      .map((group) => ({
        fixed: group.fixed,
        items: group.items
          .map(({ image: _img, ...rest }) => rest)
          .filter((item) => item.qty > 0)
      }))
      .filter((card) => card.items.length > 0)
  );

  const otherBonificated = (otherBonificatedProducts ?? [])
    .map(({ image: _img, max_selection_qty: _max, ...rest }) => rest)
    .filter((item) => item.qty > 0);

  return {
    id: promotion.promotion_id,
    bonusOptions: cards.length > 0 ? [{ cards }] : [],
    otherBonificated
  };
};
