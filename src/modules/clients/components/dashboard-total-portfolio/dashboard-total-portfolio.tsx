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
  totalInvoices = "$0",
  totalCreditNotes = "$0",
  totalBalances = "$0",
  countInvoices = 0,
  countCreditNotes = 0,
  countBalances = 0
}) => {
  const total =
    parseFloat(totalInvoices) + parseFloat(totalCreditNotes) + parseFloat(totalBalances);

  const colorBarValues = [
    { color: "#cbe71e", percentage: (parseFloat(totalInvoices) / total) * 100 },
    { color: "#9ab916", percentage: (parseFloat(totalCreditNotes) / total) * 100 },
    { color: "#000000", percentage: (parseFloat(totalBalances) / total) * 100 }
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
