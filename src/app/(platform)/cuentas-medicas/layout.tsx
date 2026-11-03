import { Metadata } from "next";
import { MedicalAccountsLayout } from "@/modules/medicalAccounts/containers/MedicalAccountsLayout/MedicalAccountsLayout";

export const metadata: Metadata = {
  title: "Cuentas Médicas",
  description: "Cuentas Médicas"
};

const CuentasMedicasLayout = ({ children }: { children: React.ReactNode }) => {
  return <MedicalAccountsLayout>{children}</MedicalAccountsLayout>;
};

export default CuentasMedicasLayout;
