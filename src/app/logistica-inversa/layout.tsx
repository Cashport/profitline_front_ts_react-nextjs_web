import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Logística Inversa",
  description: "Logística Inversa"
};

const LogisticaInversaLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitle="Listado de devoluciones">{children}</ViewWrapper>;
};

export default LogisticaInversaLayout;
