import {
  ICreatePromotionBody,
  INivel,
  IPremioOpcion,
  IPromocion,
  IPromotionGiftOption,
  IPromotionProductGroup,
  IPromotionRange
} from "@/types/marketAdmin/IMarketAdmin";

// Premios (opciones) → gift_options. Un option por premio, un item por grupo.
const buildGiftOptions = (premios: IPremioOpcion[], isSku: boolean): IPromotionGiftOption[] =>
  premios.map((premio, premioIdx) => ({
    option_number: premioIdx + 1,
    items: premio.grupos.map((grupo, grupoIdx) => {
      const esFijo = grupo.modo === "fijo";
      const cantidades = grupo.cantidadesFijas ?? {};
      const maxSelectionQty = esFijo
        ? Object.values(cantidades).reduce((sum, qty) => sum + (qty || 0), 0)
        : grupo.unidadesPool ?? 0;
      return {
        ...(isSku ? { subgroup_number: grupoIdx + 1 } : {}),
        fixed: esFijo,
        max_selection_qty: maxSelectionQty,
        items: grupo.productos.map((producto) => ({
          product_id: producto.productId,
          qty: esFijo ? cantidades[producto.id] ?? 0 : 0
        }))
      };
    })
  }));

// Condición de combinación → product_groups.
// Producto individual: un grupo con min_distincts 1 y min_qty = cantidad.
// Paquete: un grupo con min_qty = unidades, min_distincts = productos diferentes.
const buildProductGroups = (nivel: INivel): IPromotionProductGroup[] => {
  const individuales: IPromotionProductGroup[] = (nivel.productosCondicion ?? []).map((pc) => ({
    min_qty: pc.cantidad,
    min_distincts: 1,
    product_ids: [pc.productId]
  }));
  const paquetes: IPromotionProductGroup[] = (nivel.paquetesCondicion ?? []).map((pak) => ({
    min_qty: pak.unidades,
    min_distincts: pak.minProductos,
    product_ids: pak.productos.map((p) => p.productId)
  }));
  return [...individuales, ...paquetes];
};

export const buildPromotionPayload = (promo: IPromocion): ICreatePromotionBody => {
  const base = {
    name: promo.nombre,
    active: promo.activa ? 1 : 0,
    accumulable: promo.accumulable ?? 0,
    start_date: `${promo.fechaInicio ?? ""} 00:00:00`,
    end_date: `${promo.fechaFin ?? ""} 23:59:59`
  };

  if (promo.tipoCondicion === "monto") {
    const ranges: IPromotionRange[] = promo.niveles.map((nivel, idx) => ({
      range_number: idx + 1,
      min_amount: nivel.montoMinimo ?? 0,
      gift_options: buildGiftOptions(nivel.premios, false)
    }));
    return { ...base, type: "AMOUNT", ranges };
  }

  // combinación → SKU
  const ranges: IPromotionRange[] = promo.niveles.map((nivel, idx) => ({
    range_number: idx + 1,
    product_groups: buildProductGroups(nivel),
    gift_options: buildGiftOptions(nivel.premios, true)
  }));
  return {
    ...base,
    type: "SKU",
    max_usage_per_order: promo.maxUsagePerOrder ?? 0,
    max_usage_per_client: promo.maxUsagePerClient ?? 0,
    max_usage_per_client_per_month: promo.maxUsagePerClientPerMonth ?? 0,
    max_global_usage: promo.maxGlobalUsage ?? 0,
    ranges
  };
};
