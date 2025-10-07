import { FC } from "react";
import DashboardGenericItem from "../dashboard-generic-item";
import DashboardColorBar from "../dashboard-color-bar";

interface DashboardTotalPortfolioProps {
  totalWallet: string;
  className?: string;
  totalInvoices?: string;
  countInvoices?: number;
  totalCreditNotes?: string;
  countCreditNotes?: number;
  totalBalances?: string;
  countBalances?: number;
}

const DashboardTotalPortfolio: FC<DashboardTotalPortfolioProps> = ({
  totalWallet,
  className,
  totalInvoices = "0",
  totalCreditNotes = "0",
  totalBalances = "0",
  countInvoices = 0,
  countCreditNotes = 0,
  countBalances = 0
}) => {
  const colorBarValues = [
    { color: "#cbe71e", percentage: 50 },
    { color: "#9ab916", percentage: 30 },
    { color: "#000000", percentage: 20 }
  ];

  return (
    <div className={`${className}`}>
      <DashboardGenericItem name="Total cartera neta" value={totalWallet} unit="M" />

      <DashboardColorBar values={colorBarValues} />

      <DashboardGenericItem
        name="Facturas"
        value={totalInvoices}
        unit="M"
        quantity={countInvoices}
        color="#cbe71e"
      />

      <DashboardGenericItem
        name="Notas crédito"
        value={totalCreditNotes}
        unit="M"
        quantity={countCreditNotes}
        color="green"
      />

      <DashboardGenericItem
        name="Saldos"
        value={totalBalances}
        unit="M"
        quantity={countBalances}
        color="black"
      />
    </div>
  );
};

export default DashboardTotalPortfolio;
