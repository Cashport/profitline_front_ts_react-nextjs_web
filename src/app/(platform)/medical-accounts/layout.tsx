import { MedicalAccountsLayout } from "@/modules/medicalAccounts/containers/MedicalAccountsLayout/MedicalAccountsLayout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("medicalAccounts");

const CuentasMedicasLayout = ({ children }: { children: React.ReactNode }) => {
  return <MedicalAccountsLayout>{children}</MedicalAccountsLayout>;
};

export default CuentasMedicasLayout;
