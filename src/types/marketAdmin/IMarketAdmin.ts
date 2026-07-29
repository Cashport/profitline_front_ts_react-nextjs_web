// ── Tipos del feature MarketAdminPromotions ─────────────────────────────────

// ── UI / modelo de formulario ───────────────────────────────────────────────
export type TipoCondicion = "monto" | "combinacion";

// Combinación — un producto individual con cantidad fija
export interface IProductoCondicion {
  id: string;
  productId: number;
  cantidad: number;
}

// Combinación — un paquete: X unidades totales repartidas entre Y productos diferentes
export interface IPaqueteCondicion {
  id: string;
  unidades: number; // ej: 8 unidades totales (min_qty)
  minProductos: number; // ej: entre 5 productos diferentes (min_distincts)
  productos: { id: string; productId: number }[]; // productos elegibles del paquete
}

export interface IProductoPremio {
  id: string;
  productId: number;
}

export interface IGrupoPremio {
  id: string;
  // Productos en este grupo
  productos: IProductoPremio[];
  // Modo: "fijo" = cada producto tiene cantidad fija, "pool" = el cliente reparte X unidades
  modo: "fijo" | "pool";
  // Para modo fijo: cantidad por producto (keyed by IProductoPremio.id)
  cantidadesFijas?: Record<string, number>;
  // Para modo pool: total de unidades a repartir
  unidadesPool?: number;
}

export interface IPremioOpcion {
  id: string;
  // Grupos de productos en esta opción (fijos y/o pool en la misma opción)
  grupos: IGrupoPremio[];
}

export interface INivel {
  id: string;
  // Condición monto (rango)
  montoMinimo?: number;
  montoMaximo?: number;
  // Condición combinación — productos individuales con cantidad fija
  productosCondicion?: IProductoCondicion[];
  // Condición combinación — paquetes (X unidades entre Y productos)
  paquetesCondicion?: IPaqueteCondicion[];
  // Premios (opciones A, B, etc.)
  premios: IPremioOpcion[];
}

export interface IPromocion {
  id: string;
  nombre: string;
  tipoCondicion: TipoCondicion;
  activa: boolean;
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
  accumulable: number;
  // Solo combinación
  maxUsagePerOrder?: number;
  maxUsagePerClient?: number;
  maxUsagePerClientPerMonth?: number;
  maxGlobalUsage?: number;
  niveles: INivel[];
}

// ── Request body de la API (POST /promotion) ────────────────────────────────
export interface IPromotionGiftItem {
  product_id: number;
  qty: number;
}

export interface IPromotionGiftGroup {
  subgroup_number?: number; // SKU / combinación only
  fixed: boolean;
  max_selection_qty: number;
  items: IPromotionGiftItem[];
}

export interface IPromotionGiftOption {
  option_number: number;
  items: IPromotionGiftGroup[];
}

export interface IPromotionProductGroup {
  min_qty: number;
  min_distincts: number;
  product_ids: number[];
}

export interface IPromotionRange {
  range_number: number;
  range_name?: string;
  min_amount?: number; // AMOUNT
  product_groups?: IPromotionProductGroup[]; // SKU
  gift_options: IPromotionGiftOption[];
}

export interface ICreatePromotionBody {
  name: string;
  type: "AMOUNT" | "SKU";
  start_date: string;
  end_date: string;
  accumulable: number;
  active: number;
  max_usage_per_order?: number; // SKU only
  max_usage_per_client?: number;
  max_usage_per_client_per_month?: number;
  max_global_usage?: number;
  ranges: IPromotionRange[];
}
