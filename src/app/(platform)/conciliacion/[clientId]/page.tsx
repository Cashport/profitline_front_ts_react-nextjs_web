import { Metadata } from "next";

import PortfolioConciliationView from "@/modules/portfolioConciliation/containers/portfolio-conciliation-view/portfolio-conciliation-view";

export const metadata: Metadata = {
  title: "Conciliación masiva",
  description: "Conciliación masiva de la cartera del cliente"
};

export default function Concilation() {
  return <PortfolioConciliationView />;
}
