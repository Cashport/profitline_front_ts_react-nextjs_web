import { SocketProvider } from "@/context/ChatContext";
import PurchaseOrdersLayout from "@/modules/purchaseOrders/containers/purchase-orders-layout/PurchaseOrdersLayout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("purchaseOrders");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <PurchaseOrdersLayout>{children}</PurchaseOrdersLayout>
    </SocketProvider>
  );
}
