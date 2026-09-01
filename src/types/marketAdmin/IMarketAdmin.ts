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
  // Topes de uso. Aplican a AMOUNT y SKU. undefined / 0 = sin límite.
  maxUsagePerOrder?: number;
  maxUsagePerClient?: number;
  maxUsagePerClientPerMonth?: number;
  maxGlobalUsage?: number;
  // Unidad de negocio a la que aplica la promoción.
  // undefined = todas las unidades del proyecto (sin restricción).
  businessUnit?: string;
  // Promoción "flex": el cliente recibe el regalo automáticamente,
  // sin tener que elegir entre opciones A/B/C.
  isFlex?: boolean;
  // Si true, se toma SOLO el primer rango elegible aunque supere el techo.
  takeFirstEligibleRangeDiscount?: boolean;
  // Si true, la promoción se acumula con precios negociados del cliente.
  isPromotionCompatibleWithAllNegotiations?: boolean;
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
  // Unidad de negocio a la que aplica la promoción. Omitir/empty = todas.
  business_unit?: string;
  // true → el cliente recibe el regalo automáticamente sin elegir opción.
  is_flex?: number; // 0 | 1
  // true → se aplica SOLO el primer rango elegible (incluso si supera el techo).
  take_first_eligible_range_discount?: number;
  // true → la promoción se acumula con precios negociados del cliente.
  is_promotion_compatible_with_all_negotiations?: number;
  ranges: IPromotionRange[];
}

// ── Bonificados manuales por cliente ────────────────────────────────────────
export type EstadoAprobacion = "pendiente" | "aprobado" | "rechazado";

// Fila del listado (estado local / flujo de aprobación en memoria)
export interface AsignacionManual {
  id: string;
  clienteId: string; // NIT del cliente
  clienteNombre: string;
  clienteNit: string;
  productoBonificadoId: string; // Product.id como string
  productoBonificadoNombre: string;
  unidadesAsignadas: number;
  unidadesDisponibles: number;
  estado: EstadoAprobacion;
  creadoEn: string; // YYYY-MM-DD
  nota: string;
}

// Cliente normalizado para el selector (independiente del servicio que lo provee)
export interface ClienteOption {
  nit: string;
  nombre: string;
}

// Datos recolectados por el modal → entregados al contenedor
export interface NuevaAsignacionData {
  cliente: ClienteOption;
  producto: { id: number; nombre: string };
  unidades: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  nota: string;
}

// ── Request body de la API (POST /manager-botification) ─────────────────────
export interface ICreateManualBonusBody {
  customer_id: string; // NIT del cliente
  product_id: number;
  assigned_qty: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  comments: string;
}

// ── Productos del marketplace (GET/PUT /product) ────────────────────────────

export interface IUseMarketAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  lineId?: number;
  categoryId?: number;
  status?: 0 | 1;
}

// GET /product/lines — opciones del filtro de Línea
export interface IMarketAdminProductLine {
  id: number;
  description: string;
}

// GET /product/categories — opciones del filtro de Categoría
export interface IMarketAdminProductCategory {
  id: number;
  description: string;
  line_id: number;
}

export interface IMarketAdminProduct {
  id: number;
  sku: string;
  description: string; // nombre comercial
  image: string; // URL de la imagen (puede venir como ".")
  id_line: number;
  id_category: number;
  line_name: string;
  category_name: string;
  is_available: 1 | 0; // 1 → Activo, 0 → Inactivo
  project_id: number;
  product_units: number;
  order_marketplace: number;
  created_by: string;
  updated_at: string; // ISO date
  price?: number; // precio unitario
}

// GET /product/:id — detalle (superset del item de la lista)
export interface IMarketAdminProductDetail extends IMarketAdminProduct {
  taxes: number;
  kit: number | null;
  locked: number | null;
  ean: string | null;
  is_deleted: 1 | 0;
  discount_code_product_matrix: string | null; // TODO: confirmar forma real con backend
  shipment_unit: number;
  disable_discount_when_is_even: 1 | 0;
  transfer_price: number | null;
}

// PUT /product/:id — multipart/form-data, se envía solo lo que cambia
export interface IUpdateMarketAdminProductBody {
  description?: string; // nombre comercial
  is_available?: 1 | 0; // activo/inactivo
  image?: File; // archivo de imagen
}

// GET /product/:id/related-skus — SKUs ERP relacionados (is_principal === 1 → SKU principal)
export interface IRelatedSku {
  id: number;
  product_id: number;
  sku: string;
  is_principal: 1 | 0;
}

// GET /product/:id/inventory — inventario por lote y bodega
// (ordenado FIFO por vencimiento; solo lotes con stock > 0 y activos en el ERP)
export interface IProductInventoryItem {
  id_product: number;
  product_sku: string;
  id_warehouse: number;
  warehouse_code: string; // ej. "BOG-01"
  warehouse_description: string; // nombre de bodega
  batch: string; // lote visible (ERP)
  batch_provider: string; // lote del proveedor
  batch_expiration_date: string; // YYYY-MM-DD
  units: number; // disponibles (ya descontadas las usadas en órdenes)
}

// ── Clientes del marketplace (/marketplace-admin/clients) ───────────────────

export interface IUseMarketAdminClientsParams {
  page?: number;
  limit?: number;
  search?: string; // busca en client_name y client_id (NIT)
  status?: 1 | 0; // 1 → activo, 0 → inactivo
  linea?: string; // business unit, ej. "Institucional"
}

// GET /clients — item del listado
export interface IMarketAdminClient {
  client_id: string; // NIT — también es el id de ruta
  client_name: string;
  city: string;
  is_active: 1 | 0;
  usuarios_count: number;
  productos_count: number;
  lineas: string | null; // separadas por coma: "Institucional,Retail"
}

// GET /clients/:client_id — detalle + conteos de los tabs
export interface IMarketAdminClientDetail {
  nit: string;
  client_name: string;
  business_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  bu: string | null; // unidad de negocio (se muestra como "Canal")
  nit_id: number;
  pricelist_id: number | null;
  warehouse_id: number | null;
  warehouse_code: string | null;
  warehouse_description: string | null;
  is_active: 1 | 0;
  quota: number | null;
  payment_discount: number | null;
  payment_condition_code: string | null;
  negotiations_count: number;
  addresses_count: number;
  users_count: number;
  products_count: number;
  lineas: string | null;
}

// PUT /clients/batch — activar/inactivar en lote
export interface IMarketAdminClientsBatchBody {
  client_ids: string[];
  action: "activate" | "inactivate";
}

// GET /clients/:client_id/addresses — la de code_address "00" es la principal
export interface IMarketAdminClientAddress {
  id: number;
  address: string;
  city: string;
  warehouse_id: number | null;
  warehouse_code: string | null;
  warehouse_description: string | null;
  code_address: string | null;
  profit_center: string | null;
  is_principal: 1 | 0;
}

// POST /clients/:client_id/addresses — nit_id y project_id los resuelve el backend
export interface ICreateMarketAdminClientAddressBody {
  address: string;
  city: string;
  warehouse_id: number | null;
  code_address?: string; // "00" → principal
  profit_center?: string;
}

export type IUpdateMarketAdminClientAddressBody = Partial<ICreateMarketAdminClientAddressBody>;

// GET /clients/:client_id/users — usuarios con el cliente en su grupo personal
export interface IMarketAdminClientUser {
  id: number;
  name: string;
  email: string;
  role_name: string;
}

// GET /clients/:client_id/products — productos del pricelist del cliente, agrupados por categoría
export interface IMarketAdminClientProduct {
  id: number;
  SKU: string; // el backend lo envía en mayúsculas
  description: string;
  price: number;
  price_taxes: number;
  line_name: string;
}

export interface IMarketAdminClientProductCategory {
  category_id: number;
  category: string;
  products: IMarketAdminClientProduct[];
}

// GET/PUT /clients/:client_id/config
export interface IMarketAdminClientConfig {
  quota: number | null;
  payment_discount: number | null;
  payment_condition_code: string | null;
  warehouse_id: number | null;
  pricelist_id: number | null;
}

export type IUpdateMarketAdminClientConfigBody = Partial<IMarketAdminClientConfig>;

// ── Usuarios del marketplace (/marketplace-admin/users) ─────────────────────

export interface IUseMarketAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string; // busca en name y email
  role_id?: number;
  status?: 1 | 0; // 1 → activo, 0 → inactivo (company_assigments.is_active)
}

// GET /users — item del listado
export interface IMarketAdminUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  clients_count: number; // clientes del grupo personal (special_type=4)
  is_active: 1 | 0;
}

// GET /users/:id — el detalle solo devuelve nit y nombre por cliente
export interface IMarketAdminUserClient {
  nit: string;
  client_name: string;
}

export interface IMarketAdminUserDetail {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  is_active: 1 | 0;
  clients: IMarketAdminUserClient[];
}

// POST /users/:id/clients — el grupo personal lo crea el backend si no existe
export interface IAssignClientToUserBody {
  client_nits: string[];
}
