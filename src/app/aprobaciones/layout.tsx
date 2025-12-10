import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";

export const metadata: Metadata = {
  title: "Aprobaciones",
  description: "Aprobaciones"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ViewWrapper headerTitle="Aprobaciones" gapTitle="0">
        {children}
      </ViewWrapper>
    </SocketProvider>
  );
}
