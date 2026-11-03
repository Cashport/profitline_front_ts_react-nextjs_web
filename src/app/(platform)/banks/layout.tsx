import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("banks");

export default function Layout({ children }: { children: React.ReactNode }) {
  // BanksView pinta su propio Header: el buscador y Filtrar los pone la pestaña activa.
  return (
    <ViewWrapper headerTitleKey="banks" hideHeader>
      {children}
    </ViewWrapper>
  );
}
