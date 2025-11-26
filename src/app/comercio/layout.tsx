import { Metadata } from "next";
import ComercioLayout from "@/modules/commerce/containers/comercio-layout/ComercioLayout";

export const metadata: Metadata = {
  title: "Comercio",
  description: "Comercio"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComercioLayout>{children}</ComercioLayout>;
}
