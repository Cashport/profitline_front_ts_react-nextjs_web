import { Metadata } from "next";
import NoveltiesLayout from "@/modules/noveltiesModule/containers/novelties-layout/novelties-layout";

export const metadata: Metadata = {
  title: "Novedades",
  description: "Bandeja de novedades de cartera"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NoveltiesLayout>{children}</NoveltiesLayout>;
}
