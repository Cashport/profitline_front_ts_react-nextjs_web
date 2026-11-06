import { Metadata } from "next";
import SupportLayout from "@/modules/supportModule/containers/support-layout/support-layout";

export const metadata: Metadata = {
  title: "Support Desk",
  description: "Bandeja de soporte de todos los proyectos"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SupportLayout>{children}</SupportLayout>;
}
