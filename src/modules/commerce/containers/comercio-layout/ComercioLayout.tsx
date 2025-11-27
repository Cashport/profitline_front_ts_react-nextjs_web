"use client";

import { usePathname } from "next/navigation";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

interface ComercioLayoutClientProps {
  children: React.ReactNode;
}

export default function ComercioLayout({ children }: ComercioLayoutClientProps) {
  const pathname = usePathname();

  const headerTitle = pathname.startsWith("/comercio/pedido") ? "Crear orden" : "Mis pedidos";

  return <ViewWrapper headerTitle={headerTitle}>{children}</ViewWrapper>;
}
