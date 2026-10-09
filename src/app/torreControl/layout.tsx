import { Metadata } from "next";
import TorreLayout from "@/modules/torreControlModule/containers/torre-layout/torre-layout";

export const metadata: Metadata = {
  title: "Torre de control",
  description: "Indicadores y filtros cruzados de la cartera"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TorreLayout>{children}</TorreLayout>;
}
