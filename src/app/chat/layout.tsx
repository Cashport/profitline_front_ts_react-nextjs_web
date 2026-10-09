import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";
import { Toaster } from "@/modules/chat/ui/toaster";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ViewWrapper headerTitle="" gapTitle="0" hideHeader>
        {children}
        <Toaster />
      </ViewWrapper>
    </SocketProvider>
  );
}
