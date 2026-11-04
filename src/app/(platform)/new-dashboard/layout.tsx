import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("dashboard");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // El header lo pinta la vista (título según la pestaña activa)
    <ViewWrapper headerTitle="Dashboard" gapTitle="0" hideHeader>
      {children}
    </ViewWrapper>
  );
}
