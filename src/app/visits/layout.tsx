import { Metadata } from "next";
import VisitsLayout from "@/modules/visitsModule/containers/visits-layout/visits-layout";

export const metadata: Metadata = {
  title: "Visitas",
  description: "Seguimiento en vivo de las visitas de los asesores en campo"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VisitsLayout>{children}</VisitsLayout>;
}
