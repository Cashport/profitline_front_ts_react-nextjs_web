import { Metadata } from "next";
import BranchesLayout from "@/modules/branches/containers/branches-layout/branches-layout";

export const metadata: Metadata = {
  title: "Sucursales de Devolución",
  description: "Sucursales de devolución de los clientes, con su lista de precios y estado"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BranchesLayout>{children}</BranchesLayout>;
}
