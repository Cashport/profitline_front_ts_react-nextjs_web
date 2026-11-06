import { Metadata } from "next";
import SupportLayout from "@/modules/supportModule/containers/support-layout/support-layout";

export const metadata: Metadata = {
  title: "Soporte",
  description: "Solicitudes de soporte del proyecto y su seguimiento"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SupportLayout>{children}</SupportLayout>;
}
