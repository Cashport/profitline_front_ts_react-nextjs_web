import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Precintos",
  description: "Módulo de precintos"
};

// El header lo pinta PrecintosView: lleva Filtrar y el buscador (DESIGN.md §4).
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewWrapper headerTitle="Precintos" hideHeader>
      {children}
    </ViewWrapper>
  );
}
