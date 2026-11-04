import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("seals");

// El header lo pinta PrecintosView: lleva Filtrar y el buscador (DESIGN.md §4).
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitleKey="seals" hideHeader>
      {children}
    </ViewWrapper>
  );
}
