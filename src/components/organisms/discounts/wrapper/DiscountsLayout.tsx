"use client";

import { usePathname } from "next/navigation";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { DISCOUNTS_BASE } from "../constants/routes";

interface DiscountsLayoutProps {
  children: React.ReactNode;
}

/**
 * Marco de /descuentos (listado, crear/editar paquete y regla). En las pantallas
 * de segundo nivel el header muestra "‹" para volver al listado (docs/DESIGN.md §4).
 */
export default function DiscountsLayout({ children }: DiscountsLayoutProps) {
  const isList = usePathname() === DISCOUNTS_BASE;

  return (
    <ViewWrapper
      headerTitle="Configuración de descuentos"
      headerBack={isList ? undefined : DISCOUNTS_BASE}
    >
      {children}
    </ViewWrapper>
  );
}
