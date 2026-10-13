"use client";

import { usePathname } from "next/navigation";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import {
  ClientsHomeHeaderActions,
  ClientsHomeHeaderExtra
} from "../../components/clients-home/clients-home-header/clients-home-header";
import { CLIENTS_HOME_PATH } from "../../constants/clients-home";

interface ClientsLayoutProps {
  children: React.ReactNode;
}

/**
 * Marco de /clientes (Home y detalle). En el Home la página no tiene scroll
 * propio —los KPIs se esconden y la tabla desplaza sus filas—, así que va sin
 * barra de scroll ni espacio extra bajo el encabezado.
 */
export default function ClientsLayout({ children }: ClientsLayoutProps) {
  const isHome = usePathname() === CLIENTS_HOME_PATH;

  return (
    <ViewWrapper
      headerTitle="Clientes"
      headerTitleExtra={<ClientsHomeHeaderExtra />}
      headerActions={<ClientsHomeHeaderActions />}
      headerClassName={isHome ? "!pb-0" : undefined}
      contentClassName={
        isHome ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : undefined
      }
    >
      {children}
    </ViewWrapper>
  );
}
