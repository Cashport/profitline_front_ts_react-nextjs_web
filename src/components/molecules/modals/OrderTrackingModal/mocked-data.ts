import { IInvoiceDetail } from "./interfaces/interface";

export const invoiceMock: IInvoiceDetail = {
  id: "123456",
  purchaseOrderId: "34897",
  status: "En tránsito",
  client: "CRUZ VERDE",
  createdAt: "19/03/2024 - 12:42pm",
  deliveryAddress: "Medellín, Calle 10 # 38-30",
  contact: "3058544523",
  tracking: [
    {
      status: "Alistando",
      date: "06 Junio, 2023 - 10:45",
      responsible: "Juan Perez",
      estimatedValue: 24000000
    },
    {
      status: "En tránsito",
      date: "06 Junio, 2023 - 10:45",
      responsible: "Juan Perez",
      estimatedValue: 24000000
    },
    {
      status: "Entregado",
      date: "",
      responsible: "",
      estimatedValue: 0
    }
  ],
  summary: {
    value: 30000000,
    discount: 2000000,
    total: 28000000
  }
};
