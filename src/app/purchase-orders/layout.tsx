import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";

export const metadata: Metadata = {
  title: "Ordenes de compra",
  description: "Ordenes de compra"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ViewWrapper headerTitle="Ordenes de compra">{children}</ViewWrapper>
    </SocketProvider>
  );
}
