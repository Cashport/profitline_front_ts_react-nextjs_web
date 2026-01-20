export interface IPurchaseOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  deliveryDate: string;
  status: string;
  statusColor: string;
  totalProducts: number;
  totalAmount: number;
}

export interface IPurchaseOrderStatus {
  id: number;
  name: string;
  color: string;
}

export interface IPurchaseOrderClient {
  id: string;
  name: string;
}

export interface IPurchaseOrderSeller {
  id: string;
  name: string;
}

export interface IPurchaseOrderFilters {
  statuses?: IPurchaseOrderStatus[];
  clients?: IPurchaseOrderClient[];
  sellers?: IPurchaseOrderSeller[];
}

export interface IUsePurchaseOrdersParams {
  // Pagination (optional with defaults)
  page?: number;
  pageSize?: number;

  // Search (optional)
  search?: string;

  // Filter IDs (optional)
  clientId?: string;
  sellerId?: string;
  statusId?: number;

  // Date ranges (optional, ISO8601 strings)
  createdFrom?: string;
  createdTo?: string;
}

export interface IPurchaseOrderDetail {
  id: number;
  operation_number: number;
  project_id: number;
  client_id: string;
  order_type_id: number;
  total: number;
  order_type_name: string;
  purchase_order_detail_id: number;
  purchase_order_number: string;
  delivery_date: string;
  status_id: number;
  status_name: string;
  status_color: string;
  observations: string;
  document_url: string;
  document_name: string;
  client_name: string;
  client_nit: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  created_by_email: string;
  products: IPurchaseOrderProduct[];
  status_history: IPurchaseOrderStatusHistory[];
  tracking: IPurchaseOrderTracking[];
  summary: IPurchaseOrderSummary;
}

export interface IPurchaseOrderProduct {
  marketplace_order_product_id: number;
  product_id: number | null;
  image: string | null;
  category_id: number | null;
  product_description: string;
  product_sku: string;
  line_id: number | null;
  unit_price: number;
  tax_amount: number;
  quantity: number;
  subtotal: number;
  total_taxes: number;
  total_price: number;
}

export interface IPurchaseOrderStatusHistory {
  status_name: string;
  status_color: string;
  changed_at: string;
}

export interface IPurchaseOrderTracking {
  id: number;
  marketplace_order_id: number;
  step_id: number;
  step_name: string;
  step_order: number;
  step_icon: string;
  is_step_complete: number;
  event_description: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface IPurchaseOrderSummary {
  totalQuantity: number;
  subtotal: number;
  totalTaxes: number;
  grandTotal: number;
}
