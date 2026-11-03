
import PortfolioConciliationView from "@/modules/portfolioConciliation/containers/portfolio-conciliation-view/portfolio-conciliation-view";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("bulkReconciliation");

export default function Concilation() {
  return <PortfolioConciliationView />;
}
