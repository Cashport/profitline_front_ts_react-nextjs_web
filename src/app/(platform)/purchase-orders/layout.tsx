import { Metadata } from "next";
import { SocketProvider } from "@/context/ChatContext";
import PurchaseOrdersLayout from "@/modules/purchaseOrders/containers/purchase-orders-layout/PurchaseOrdersLayout";

export const metadata: Metadata = {
  title: "Ordenes de compra",
  description: "Ordenes de compra"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <PurchaseOrdersLayout>{children}</PurchaseOrdersLayout>
    </SocketProvider>
  );
}
