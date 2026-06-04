export interface IEcommerceClient {
  client_id: string;
  client_name: string;
  client_email: string;
  payment_type: number;
  client_bu: IClientBU[];
}

export interface IClientBU {
  internal_code: string;
  bu_name: string;
}
export interface IProductData {
  category_id: number;
  category: string;
  products: IProduct[];
}

export interface IProduct {
  id: number;
  SKU: string;
  description: string;
  image: string;
  id_line: number;
  id_category: number;
  taxes: number;
  kit: number | null;
  locked: number | null;
  is_available: number;
  EAN: string | null;
  project_id: number;
  price: number;
  price_taxes: number;
  line_name: string;
  category_name: string;
  shipment_unit: number;
  created_by?: string;
  updated_at?: string;
  is_deleted?: number;
  discount_code_product_matrix?: null;
  order_marketplace?: number;
  product_units?: number;
  category_id?: number;
}

export interface ISelectedProduct {
  id: number;
  name: string;
  price: number;
  price_taxes: number;
  discount: number | undefined;
  discount_percentage: number | undefined;
  quantity: number;
  image: string;
  category_id: number;
  category_name: string;
  SKU: string;
  EAN?: string | null;
  stock: boolean;
  shipment_unit: number;
  autoAssigned?: boolean;
}

export interface IFetchedCategories {
  category: string;
  products: ISelectedProduct[];
}

export interface IExecutiveDiscount {
  product_sku: string;
  primary_discount_pct: number;
  secondary_discount_pct: number;
}
export interface IConfirmOrderData {
  discount_package: IDiscountPackageAvailable | undefined;
  order_summary: {
    product_sku: string;
    quantity: number;
  }[];
  executive_discounts: IExecutiveDiscount[];
  deactivate_cross_selling: boolean;
  promotion_id?: number;
}

export interface IProductInDetail {
  id: number;
  product_sku: string;
  product_name: string;
  quantity: number;
  price: number;
  price_taxes: number;
  taxes: number;
  image: string;
  id_category: number;
  category_name: string;
  discount: number;
  discount_percentage: number;
  shipment_unit: number;
}
export interface DiscountApplied {
  id: number;
  discount: number;
  description: string;
  discount_name: string;
  max_discount: number;
}

export interface PrimaryDiscount {
  product_id: number;
  product_sku: string;
  description: string;
  price: number;
  unit_discount: number;
  discount_applied: DiscountApplied;
  new_price: number;
  new_price_taxes: number;
}

export interface Discount {
  subtotalDiscount: number;
  primary: PrimaryDiscount;
  secondary?: PrimaryDiscount;
}
export interface DiscountItem {
  product_sku: string;
  quantity: number;
  shipment_unit: number;
  price: number;
  price_taxes: number;
  taxes: number;
  image: string;
  category_id: number;
  line_id: number;
  product_id: number;
  description: string;
  discount: Discount;
}
export interface DiscountOrder {
  discountId: number;
  discount: number;
}
export interface OrderDiscount {
  totalDiscount: number;
  totalOrderDiscount: number;
  totalProductDiscount: number;
  discountOrder: DiscountOrder[];
  discountItems: DiscountItem[];
  secondaryDiscount: {
    id: number;
    name: string;
  };
}

export interface IOtherBonificatedProduct {
  product_id: number;
  qty: number;
  max_selection_qty: number;
  sku: string;
  description: string;
  image: string;
}

export interface IBonificatedProductsPost {
  product_id: number;
  quantity: number;
  product_sku: string;
  description: string;
}

export interface IGiftItem {
  product_id: number;
  qty: number;
  sku: string;
  description: string;
  image: string;
}

export interface IBonus {
  id?: number;
  bonusOptions: {
    cards: {
      fixed: boolean;
      items: Omit<IGiftItem, "image">[];
    }[];
  }[];
  otherBonificated: Omit<IGiftItem, "image">[];
}

export interface IGiftItemGroup {
  gift_item_group_id: number;
  gift_group_id: number;
  max_selection_qty: number;
  items: IGiftItem[];
  fixed: boolean;
  subgroup_number: number;
}

export interface IGiftOption {
  gift_group_id: number;
  option_number: number;
  items: IGiftItemGroup[];
}

export interface IPromotionRange {
  range_id: number;
  range_number: number;
  min_amount: number;
  is_eligible: boolean;
  amount_remaining: number;
  progress_message: string;
  gift_options: IGiftOption[];
}

export interface IPromotion {
  promotion_id: number;
  promotion_name: string;
  promotion_type: string;
  active_range: IPromotionRange;
  ranges: IPromotionRange[];
}

export interface IOrderConfirmedResponse {
  discount_package: {
    id: number;
    idAnnualDiscount: number;
  };
  products?: Omit<DiscountItem, "discount">[];
  subtotal: number;
  taxes: number;
  discounts: OrderDiscount;
  total: number;
  total_pronto_pago: number;
  insufficientStockProducts: string[];
  promotion?: IPromotion;
  other_bonificated_products?: IOtherBonificatedProduct[];
}

export interface IOrderSummaryPayload extends Omit<IOrderConfirmedResponse, "discount_package"> {
  discount_package: IDiscountPackageAvailable;
  executive_discounts: IExecutiveDiscount[];
  deactivate_cross_selling: boolean;
}

export interface IShippingInformation {
  address: string;
  city: string;
  dispatch_address: string;
  email: string;
  phone_number: string;
  comments: string;
  // selected id address
  id?: number | string;
}

export interface IOrderSplitShippingInfo {
  address: string;
  city: string;
  dispatch_address: string;
  email: string;
  phone_number: string;
  comments: string;
  id?: number;
}

export interface IOrderSplitDetail {
  index: number;
  shipping_information: IOrderSplitShippingInfo;
  products: DiscountItem[];
  bonificated_products?: IBonificatedProductsPost[];
  other_bonificated_products?: IBonificatedProductsPost[];
}

export interface ICreateOrderData {
  order_summary: IOrderSummaryPayload;
  is_electronic_invoicing: number;
  order_split_details: IOrderSplitDetail[];
  promotion_id: number;
}

export interface ISucessCreateOrder {
  packageId: number;
  draftId: number;
  orders: {
    orderId: number;
    index: number;
  }[];
  notificationId: number;
}

export interface ICommerceAddressAndDetails {
  addresses: ICommerceAdresses[];
  phone: string;
}
export interface ICommerceAdresses {
  address: string;
  city: string;
  email: string;
  id: number;
  warehouse_id: number;
  warehouse: string;
  warehouse_description: string;
}
export interface ICommerceAddressesData {
  otherAddresses: ICommerceAdresses[];
  phone: string;
}

export interface IClientSummary {
  client: {
    nit: string;
    uuid: string;
    name: string;
    payment_type: number;
  };
  main_address: {
    label: string;
    address: string;
    city: string;
  };
  cartera: {
    totalPortfolio: number;
    pastDueAmount: number;
  };
  cupo: {
    totalQuota: number;
    availableQuota: number;
    percentageUsed: number;
    availablePercentage: number;
  };
}

export interface ISingleOrder {
  id: number;
  operation_number: number;
  client_id: string;
  project_id: number;
  city: string;
  contacto: string;
  total: number;
  total_without_taxes: number;
  total_pronto_pago: number;
  order_status: string;
  detail: IDetailOrder;
  shipping_info: IShippingInformation;
  created_by: number;
  order_date: string;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  is_draft: number;
  client_name: string;
  block_flag: boolean;
  vendor_name: string;
}

interface IDetailOrder {
  products: ICategories[];
  subtotal: number;
  discounts: OrderDiscount;
  discount_package_id: number;
  taxes: number;
  total_pronto_pago: number;
  total: number;
  insufficientStockProducts: any[];
  discount_name?: string;
}

export interface ICategories {
  id_category: number;
  category: string;
  products: IProductInDetail[];
}

export interface IOrderData {
  color: string;
  status: string;
  status_id: number;
  count: number;
  orders: IOrder[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface IOrder {
  order_status: string;
  order_status_id: number;
  rgb: string;
  id: number;
  operation_number: number;
  order_date: string;
  city: string;
  contacto: string;
  total: number;
  total_pronto_pago: number;
  client_name: string;
  vendor_name: string;
  warehousename: string;
  warehouseid: number;
  last_datestamp: string | null;
  files: string | null;
  notification_id: number | null;
  incident_id: number | null;
  has_stock: number;
}
export interface IDraftOrder {
  id: number;
  mongo_id: string;
  client_id: string;
  total: number;
  subtotal: number;
  taxes: number;
  total_discount: number;
  product_count: number;
  city: string;
  order_date: string;
  warehouseid: number;
  client_name: string;
  vendor_name: string;
  warehousename: string;
  is_draft: boolean;
}

export interface IDraftOrderDetail {
  id: number;
  mongo_id: string;
  project_id: number;
  client_id: string;
  created_by: number;
  total: number;
  subtotal: number;
  taxes: number;
  total_discount: number;
  product_count: number;
  city: string;
  warehouse_id: number;
  warehouse_name: string;
  created_at: string;
  client_name: string;
  vendor_name: string;
  order_summary: IOrderSummaryPayload;
  shipping_info: IShippingInformation;
  executive_discounts: IExecutiveDiscount[];
}

export interface IDiscount {
  id: number;
  discount_name: string;
  description: string;
  id_client: string;
  discount_type_id: number;
}

export interface IDiscountPackageAvailable {
  id: number;
  idAnnualDiscount: number;
  name: string;
  description: string;
  priority?: number;
  is_combinable?: number;
}

// Define la interfaz para los vendedores individuales.
interface ISeller {
  id: number;
  name: string;
  checked: boolean;
}

// Define la interfaz para los grupos de vendedores.
interface ISellerGroup {
  id: number;
  name: string;
  sellers: ISeller[];
}

// Define la interfaz principal que contiene el filtro de vendedores.
export interface IMarketplaceOrdersFilters {
  sellerFilter: ISellerGroup[];
}

// Sales Dashboard Interfaces
export interface IUnitsByCategory {
  categoria: number;
  producto: string;
  cantidad: number;
  monto: number;
}

// Base interface with common metrics for sales dashboard
interface ISalesDashboardMetrics {
  total_sales: number;
  total_sales_pp: number;
  total_sales_invoiced: number;
  total_sales_pp_invoiced: number;
  total_sales_in_process: number;
  total_sales_pp_in_process: number;
  total_sales_pending: number;
  total_sales_pp_pending: number;
  total_sales_wallet: number;
  total_sales_pp_wallet: number;
  cuantity_orders: number;
  total_cuota: number;
  percentage_cuota: number;
  pending_cuota: number;
  units_by_category: IUnitsByCategory[];
  total_sales_month: number;
  total_sales_previous_month: number;
  percentage_sales_comparison: number;
  total_products_month: number;
  total_products_previous_month: number;
  percentage_products_comparison: number;
  unique_clients_month: number;
  orders_pending_month: number;
}

export interface ISalesDashboardTotal extends ISalesDashboardMetrics {}

export interface ISalesDashboardSeller extends ISalesDashboardMetrics {
  seller: string;
}

export interface ISalesDashboardSellerLeader extends ISalesDashboardMetrics {
  seller_leader: string;
  sellers: ISalesDashboardSeller[];
}

export interface ISalesDashboard {
  total: ISalesDashboardTotal;
  seller_leaders: ISalesDashboardSellerLeader[];
}

export interface IPaymentLinkData {
  ticket_id: string;
  fecha_vencimiento: string;
  hora_vencimiento: string;
  amount: number;
  descripcion: string;
  email: string;
}

export interface IGeneratePaymentLinkResponse {
  id: number;
  client: string;
  amount: number;
  status: string;
  expiration: string;
  link: string;
}

export interface IWarehouseProductsStock {
  sku: string;
  product_id: number;
  quantity: number;
  description: string;
  requested: number;
  inWarehouse: number;
}

export interface IInventoriesByWarehouse {
  id: number;
  warehouse: string;
  warehouse_description?: string;
  availability: boolean;
  availability_msg: string;
}
