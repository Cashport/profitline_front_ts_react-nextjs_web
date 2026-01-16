import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";
import { AppProvider } from "@/modules/purchaseOrders/context/app-context";

export const metadata: Metadata = {
  title: "Ordenes de compra",
  description: "Ordenes de compra"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <AppProvider>
        <ViewWrapper headerTitle="Ordenes de compra">{children}</ViewWrapper>
      </AppProvider>
    </SocketProvider>
  );
}
