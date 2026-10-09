import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Profit360FiltersProvider } from "@/modules/reverseLogistics/contexts/Profit360FiltersContext";
import { ReverseLogisticsFiltersProvider } from "@/modules/reverseLogistics/contexts/ReverseLogisticsFiltersContext";

export const metadata: Metadata = {
  title: "Logística Inversa",
  description: "Logística Inversa"
};

const LogisticaInversaLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewWrapper headerTitle="Listado de devoluciones">
      {/* ReverseLogisticsFiltersProvider mounted at the route layout so the
          devoluciones + aprobaciones tabs keep their filter / search / page /
          selection state when the user navigates between sibling
          /logistica-inversa/* pages. App Router preserves the layout subtree
          across those navigations, so the provider state survives too. */}
      <ReverseLogisticsFiltersProvider>
        {/* Provider mounted at the route layout so every /logistica-inversa/*
            page (devoluciones list, aprobaciones list, aprobacion detail) gets
            the cached picklists (clientes / estados / causales) fetched by
            useProfit360Filters() without each tab refetching. */}
        <Profit360FiltersProvider>{children}</Profit360FiltersProvider>
      </ReverseLogisticsFiltersProvider>
    </ViewWrapper>
  );
};

export default LogisticaInversaLayout;
