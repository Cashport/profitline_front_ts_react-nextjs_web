"use client";

import { usePathname } from "next/navigation";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

interface ComercioLayoutClientProps {
  children: React.ReactNode;
}

export default function ComercioLayout({ children }: ComercioLayoutClientProps) {
  const pathname = usePathname();

  let headerTitle = "Mis pedidos";
  if (pathname.startsWith("/comercio/pedido")) {
    headerTitle = "Crear orden";
  } else if (pathname.startsWith("/comercio/dashboard")) {
    headerTitle = "Dashboard";
  }

  return <ViewWrapper headerTitle={headerTitle}>{children}</ViewWrapper>;
}
