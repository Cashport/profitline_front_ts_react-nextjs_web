import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";
import { Toaster } from "@/modules/chat/ui/toaster";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("chat");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ViewWrapper headerTitle="Chat" gapTitle="0">
        {children}
        <Toaster />
      </ViewWrapper>
    </SocketProvider>
  );
}
