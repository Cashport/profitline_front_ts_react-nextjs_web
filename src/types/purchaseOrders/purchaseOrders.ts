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
