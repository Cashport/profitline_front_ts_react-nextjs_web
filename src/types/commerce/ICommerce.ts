export interface IEcommerceClient {
  client_id: string;
  client_name: string;
  client_email: string;
  payment_type: number;
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
  kit: number;
  locked: number;
  is_available: number;
  EAN: string;
  project_id: number;
  price: number;
  price_taxes: number;
  line_name: string;
  category_name: string;
  shipment_unit: number;
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
  stock: boolean;
  shipment_unit: number;
}

export interface IFetchedCategories {
  category: string;
  products: ISelectedProduct[];
}

export interface IConfirmOrderData {
  discount_package: IDiscountPackageAvailable | undefined;
  order_summary: {
    product_sku: string;
    quantity: number;
  }[];
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
}

export interface PrimaryDiscount {
  product_id: number;
  product_sku: string;
  description: string;
  price: number;
  unit_discount: number;
  discount_applied: DiscountApplied;
  new_price: number;
}

export interface Discount {
  subtotalDiscount: number;
  primary: PrimaryDiscount;
}
export interface DiscountItem {
  product_sku: string;
  quantity: number;
  price: number;
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
}

export interface IOrderConfirmedResponse {
  discount_package: {
    id: number;
    idAnnualDiscount: number;
  };
  products?: IProductInDetail[];
  subtotal: number;
  taxes: number;
  discounts: OrderDiscount;
  total: number;
  total_pronto_pago: number;
  insufficientStockProducts: string[];
}

export interface IShippingInformation {
  address: string;
  city: string;
  dispatch_address: string;
  email: string;
  phone_number: string;
  comments: string;
  // selected id address
  id?: string;
}

export interface ICreateOrderData {
  shipping_information: IShippingInformation;
  order_summary: IOrderConfirmedResponse;
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
}
export interface ICommerceAddressesData {
  otherAddresses: ICommerceAdresses[];
  phone: string;
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
