import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Cuentas Médicas",
  description: "Cuentas Médicas"
};

const CuentasMedicasLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitle="Cuentas Médicas">{children}</ViewWrapper>;
};

export default CuentasMedicasLayout;
