"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

// Marco de /logistica-inversa/*. El detalle de una devolución
// (/logistica-inversa/devoluciones/:id) pinta su propio encabezado — volver,
// número de la devolución, causal y búsqueda — así que ahí se oculta el general.
export function ReverseLogisticsLayout({ children }: { children: ReactNode }) {
  const isDevolucionDetail = usePathname().startsWith("/logistica-inversa/devoluciones/");

  return (
    <ViewWrapper headerTitle="Listado de devoluciones" hideHeader={isDevolucionDetail}>
      {children}
    </ViewWrapper>
  );
}
