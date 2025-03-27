export interface IInvoiceDetail {
  id: string;
  purchaseOrderId: string;
  status: "Alistando" | "En tránsito" | "Entregado";
  client: string;
  createdAt: string;
  deliveryAddress: string;
  contact: string;
  tracking: ITrackingStep[];
  summary: IInvoiceSummary;
}

export interface ITrackingStep {
  status: "Alistando" | "En tránsito" | "Entregado";
  date: string;
  responsible: string;
  estimatedValue: number;
}

export interface IInvoiceSummary {
  value: number;
  discount: number;
  total: number;
}
