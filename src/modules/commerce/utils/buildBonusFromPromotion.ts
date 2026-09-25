import { IBonus, IOtherBonusGroup, IPromotion } from "@/types/commerce/ICommerce";

/**
 * Reconstruye el estado `IBonus` desde el `promotion` guardado en un borrador.
 * Contraparte de `handleConfirm` (modal-bonus): mapea
 * `active_range.gift_options[].items` (grupos fixed/pool) a `bonusOptions[].cards`,
 * tomando la cantidad elegida del propio `qty` de cada item del borrador
 * (única fuente de las selecciones en la respuesta del draft). Descarta items
 * con qty 0.
 *
 * Para los "other bonified" (`otherBonificatedProducts`) replica la misma forma
 * que `bonusOptions`: agrupa los subgrupos (fijos / pool) bajo su `group_id`,
 * conservando `description`, `assigned_qty`, `available_qty` y
 * `expiration_date` del grupo para mostrarlos en UI.
 */
export const buildBonusFromPromotion = (
  promotion?: IPromotion,
  otherBonificatedProducts?: IOtherBonusGroup[]
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
    .map((group) => ({
      group_id: group.group_id,
      description: group.description,
      assigned_qty: group.assigned_qty,
      available_qty: group.available_qty,
      expiration_date: group.expiration_date,
      cards: group.items
        .map((subgroup) => ({
          fixed: subgroup.fixed,
          subgroup_number: subgroup.subgroup_number,
          max_selection_qty: subgroup.max_selection_qty,
          items: subgroup.items
            .map(({ image: _img, ...rest }) => rest)
            .filter((item) => item.qty > 0)
        }))
        .filter((card) => card.items.length > 0)
    }))
    .filter((group) => group.cards.length > 0);

  return {
    id: promotion.promotion_id,
    bonusOptions: cards.length > 0 ? [{ cards }] : [],
    otherBonificated
  };
};