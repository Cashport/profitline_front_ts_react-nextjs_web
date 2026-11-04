import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("settings");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewWrapper headerTitle="" gapTitle="0" hideHeader contentClassName="cp-scroll-cards">
      {children}
    </ViewWrapper>
  );
}
