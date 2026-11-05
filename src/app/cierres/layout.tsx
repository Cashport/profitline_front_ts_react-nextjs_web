import { Metadata } from "next";
import ClosingsLayout from "@/modules/closingsModule/containers/closings-layout/closings-layout";

export const metadata: Metadata = {
  title: "Cierres de cartera",
  description: "Informes de cierre de cartera y recaudo, fijos al corte de cada mes"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClosingsLayout>{children}</ClosingsLayout>;
}
