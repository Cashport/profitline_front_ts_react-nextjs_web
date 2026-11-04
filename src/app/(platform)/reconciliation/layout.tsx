import { FC, ReactNode } from "react";

import ReconciliationLayout from "@/modules/portfolioConciliation/containers/reconciliation-layout/reconciliation-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("reconciliation");

interface ConcilationLayoutProps {
  children?: ReactNode;
}

const ConcilationLayout: FC<ConcilationLayoutProps> = ({ children }) => {
  return <ReconciliationLayout>{children}</ReconciliationLayout>;
};

export default ConcilationLayout;
