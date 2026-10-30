import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Bancos",
  description: "Bancos"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // BanksView pinta su propio Header: el buscador y Filtrar los pone la pestaña activa.
  return (
    <ViewWrapper headerTitle="Bancos" hideHeader>
      {children}
    </ViewWrapper>
  );
}
