import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Aplicación de pago",
  description: "Aplicación de pago"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="Aplicación de pago">{children}</ViewWrapper>;
}
