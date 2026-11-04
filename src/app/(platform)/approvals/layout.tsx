import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { SocketProvider } from "@/context/ChatContext";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("approvals");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <ViewWrapper headerTitleKey="approvals">{children}</ViewWrapper>
    </SocketProvider>
  );
}
