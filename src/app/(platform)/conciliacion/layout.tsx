import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Conciliación",
  description: "Conciliación"
};

interface ConcilationLayoutProps {
  children?: ReactNode;
}

const ConcilationLayout: FC<ConcilationLayoutProps> = ({ children }) => {
  // Pantalla de segundo nivel (se entra desde el detalle del cliente): "‹" vuelve atrás.
  return (
    <ViewWrapper headerTitle="Conciliación" headerBack="/clientes/all">
      {children}
    </ViewWrapper>
  );
};

export default ConcilationLayout;
