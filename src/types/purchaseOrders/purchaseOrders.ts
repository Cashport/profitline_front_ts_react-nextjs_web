export interface IOrder {
  packageId: number;
  id: number;
  orderNumber: string;
  purchaseOrderId: number;
  deliveryAddress: string;
  deliveryDate: string;
  orderDate: string;
  status: string;
  statusColor: string;
  totalProducts: number;
  openNovelties: number;
  noveltyTypes: string;
  invoiceCount: number;
  invoices: IinvoicePurchaseOrder[] | null;
  totalAmount: number;
  warehouseId: number | null;
}

export interface IPurchaseOrder {
  packageId: number;
  packageNumber: number;
  clientId: string;
  customerName: string;
  totalAmount: number;
  orderCount: number;
  totalProducts: number;
  deliveryDate: string;
  orderDate: string;
  created_at: string;
  max_disruption_level: number;
  openNovelties: number;
  noveltyTypes: string;
  invoiceCount: number;
  invoices: IinvoicePurchaseOrder[] | null;
  status: string;
  statusColor: string;
  orders: IOrder[];
}

export interface IinvoicePurchaseOrder {
  invoice_id: string;
  invoice_file_url: string;
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
  delivery_address: IPurchaseOrderDeliveryAddress;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  created_by_email: string;
  products: IPurchaseOrderProduct[];
  status_history: IPurchaseOrderStatusHistory[];
  package: IPackageInfoPurchaseOrder;
  tracking: IPurchaseOrderTracking[];
  summary: IPurchaseOrderSummary;
  novelties: IPurchaseOrderNovelty[];
  invoices: IPurchaseOrderInvoice[];
  warehouseId: number | null;
}

export interface IPackageInfoPurchaseOrder {
  totalOrders: number;
  totalAmount: number;
  sibilingOrders: ISibilingOrder[];
}

export interface ISibilingOrder {
  packageId: number;
  id: number;
  purchaseOrderDetailId: number;
  statusId: number;
  orderNumber: string;
  purchaseOrderId: number;
  deliveryAddress: string;
  deliveryDate: string;
  orderDate: string;
  status: string;
  statusColor: string;
  totalProducts: number;
  openNovelties: number;
  noveltyTypes: string;
  invoiceCount: number;
  invoices: string[] | null;
  totalAmount: number;
  warehouseId: number;
  clientId: string;
}

export interface IPurchaseOrderInvoice {
  invoice_id: string;
  invoice_file_url: string;
}

export interface IPurchaseOrderDeliveryAddress {
  id: number;
  city: string;
  email: string;
  address: string;
  comments: string;
  location_id: number | null;
  phone_number: string;
  dispatch_address: string;
}

export interface IPurchaseOrderNovelty {
  id: number;
  novelty_type_id: number;
  novelty_type_name: string;
  description: string;
  is_ia: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
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
  quantity_by_box: number | null;
  box_quantity: number | null;
  subtotal: number;
  total_taxes: number;
  total_price: number;
  batch_id: number | null;
  batch: string | null;
  has_novelty: boolean;
  purchase_order_original: IPurchaseOrderOriginal | null;
}

export interface IPurchaseOrderOriginal {
  po_product_description: string;
  po_quantity: number;
  po_unit_price: number;
  po_total_price: number;
  novelty: string | null;
}

export interface IEditPurchaseOrderProduct {
  marketplace_order_product_id: number;
  quantity?: number;
  price?: number;
  product_id?: number;
  batch_id?: number;
  quantity_by_box?: number;
  box_quantity?: number;
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

export interface IHistoryTimelineEvent {
  id: number;
  marketplace_order_id: number;
  step_id: number;
  step_name: string;
  step_order: number;
  step_icon: string;
  step_description: string;
  is_step_complete: number;
  event_description: string;
  is_ia: number;
  is_novelty: number;
  is_resolved: number;
  novelty_type_id: number | null;
  novelty_type_name: string | null;
  resolution_date: string | null;
  created_by: number;
  created_by_name: string;
  created_by_email: string;
  created_at: string;
  updated_at: string;
}

// Purchase Order Actions - Discriminated Union Types
export interface IDispatchActionPayload {
  action: "dispatch";
  data: Record<string, never>;
  observation: string;
}

export interface IInvoiceActionPayload {
  action: "invoice";
  data: {
    invoice_ids: string[];
  };
  observation: string;
}

export interface IApproveActionPayload {
  action: "approve";
  data: {
    approvers: Array<{ userId: number; order: number }>;
  };
  observation: string;
}

export type IPurchaseOrderActionPayload =
  | IDispatchActionPayload
  | IInvoiceActionPayload
  | IApproveActionPayload;

// Approver type from API
export interface IApprover {
  user_id: number;
  user_name: string;
  user_rol: string;
}

export interface IApproversResponse {
  templateId: number;
  approvers: IApprover[];
}

export interface IUploadPurchaseOrderResponse {
  marketplace_order_id: string;
  purchase_order_detail_id: string;
  status: string;
  document_url: string;
  products_count: number;
}

export interface IBatchByProduct {
  id: number;
  batch: string;
}

export interface IBatchesByPurchaseOrder {
  product_id: number;
  batches: IBatchByProduct[];
}
