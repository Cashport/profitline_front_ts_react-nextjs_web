import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Crear Descuento",
  description: "Crear Descuento"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="Configuración de descuentos">{children}</ViewWrapper>;
}
