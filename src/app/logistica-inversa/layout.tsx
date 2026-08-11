import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Profit360FiltersProvider } from "@/modules/reverseLogistics/contexts/Profit360FiltersContext";

export const metadata: Metadata = {
  title: "Logística Inversa",
  description: "Logística Inversa"
};

const LogisticaInversaLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Listado de devoluciones">
      {/* Provider mounted at the route layout so every /logistica-inversa/*
          page (devoluciones list, aprobaciones list, aprobacion detail) gets
          the cached picklists (clientes / estados / causales) fetched by
          useProfit360Filters() without each tab refetching. */}
      <Profit360FiltersProvider>{children}</Profit360FiltersProvider>
    </ViewWrapper>
  );
};

export default LogisticaInversaLayout;
