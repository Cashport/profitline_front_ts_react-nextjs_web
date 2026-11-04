import { ReactNode } from "react";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

// Marco de /reverse-logistics/*. Cada página pinta su propio encabezado (la lista y las
// aprobaciones con ReverseLogisticsView, el detalle de una devolución con el suyo), así que el
// del marco va oculto: si se mostrara, el título saldría dos veces.
export function ReverseLogisticsLayout({ children }: { children: ReactNode }) {
  return <ViewWrapper hideHeader>{children}</ViewWrapper>;
}
