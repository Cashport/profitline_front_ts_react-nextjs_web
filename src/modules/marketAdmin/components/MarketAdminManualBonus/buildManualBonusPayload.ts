import {
  ICreateManualBonusBody,
  IGrupoPremio,
  IManualBonusItem,
  NuevaAsignacionData
} from "@/types/marketAdmin/IMarketAdmin";
import { Product } from "@/types/products/products";

// Unidades que representa un grupo: fijo → suma de cantidades; pool → unidades a repartir.
// Misma regla que buildGiftOptions en MarketAdminPromotions/buildPromotionPayload.ts.
export const grupoMaxSelectionQty = (grupo: IGrupoPremio): number =>
  grupo.modo === "fijo"
    ? Object.values(grupo.cantidadesFijas ?? {}).reduce((sum, qty) => sum + (qty || 0), 0)
    : grupo.unidadesPool ?? 0;

const buildItems = (grupos: IGrupoPremio[]): IManualBonusItem[] =>
  grupos.map((grupo, idx) => {
    const esFijo = grupo.modo === "fijo";
    const cantidades = grupo.cantidadesFijas ?? {};
    return {
      subgroup_number: idx + 1,
      fixed: esFijo,
      max_selection_qty: grupoMaxSelectionQty(grupo),
      products: grupo.productos.map((producto) => ({
        product_id: producto.productId,
        qty: esFijo ? cantidades[producto.id] ?? 0 : 1
      }))
    };
  });

// Modelo del formulario (UI) → body de la API (POST /manager-bonification)
export const buildManualBonusPayload = (data: NuevaAsignacionData): ICreateManualBonusBody => {
  const items = buildItems(data.grupos);
  return {
    customer_id: data.cliente.nit,
    assigned_qty: items.reduce((sum, item) => sum + item.max_selection_qty, 0),
    expiration_date: `${data.fechaExpiracion}T23:59:59Z`,
    end_date: `${data.fechaFin}T23:59:59Z`,
    comments: data.nota,
    items
  };
};

// Resumen para las filas en memoria de los listados (sin endpoint de listado aún).
export const summarizeManualBonus = (grupos: IGrupoPremio[], productos: Product[]) => {
  const nombres = grupos
    .flatMap((g) => g.productos)
    .map((p) => productos.find((prod) => prod.id === p.productId)?.description)
    .filter(Boolean);
  return {
    unidades: grupos.reduce((sum, g) => sum + grupoMaxSelectionQty(g), 0),
    productos: nombres.join(", ")
  };
};
