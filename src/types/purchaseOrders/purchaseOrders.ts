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
