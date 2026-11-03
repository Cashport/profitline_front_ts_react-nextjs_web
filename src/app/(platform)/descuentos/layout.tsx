import { Metadata } from "next";
import DiscountsLayout from "@/components/organisms/discounts/wrapper/DiscountsLayout";

export const metadata: Metadata = {
  title: "Crear Descuento",
  description: "Crear Descuento"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DiscountsLayout>{children}</DiscountsLayout>;
}
