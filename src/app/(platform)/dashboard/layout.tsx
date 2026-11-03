import { Metadata } from "next";
import RecaudoLayout from "@/modules/recaudoModule/containers/recaudo-layout/recaudo-layout";

export const metadata: Metadata = {
  title: "Torre de control de recaudo",
  description: "Meta, forecast, acuerdos de pago y PNA del mes"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RecaudoLayout>{children}</RecaudoLayout>;
}
