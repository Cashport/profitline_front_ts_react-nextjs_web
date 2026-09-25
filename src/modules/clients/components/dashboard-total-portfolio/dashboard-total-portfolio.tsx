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
  const parseValue = (value: string): number => {
    if (!value) return 0;

    const normalized = value
      .replace(/\./g, "") // 1. Quita los puntos de miles: "7.219,2" -> "7219,2"
      .replace(",", ".") // 2. Cambia coma por punto: "7219,2" -> "7219.2"
      .replace(/[^0-9.-]+/g, ""); // 3. Limpia basura ($ o espacios)

    return parseFloat(normalized) || 0;
  };

  const totalInvoicesNum = parseValue(totalInvoices);
  const totalCreditNotesNum = parseValue(totalCreditNotes);
  const totalBalancesNum = parseValue(totalBalances);

  const total = totalInvoicesNum + totalCreditNotesNum + totalBalancesNum;

  const colorBarValues =
    total > 0
      ? [
          { color: "#cbe71e", percentage: (totalInvoicesNum / total) * 100 },
          { color: "#9ab916", percentage: (totalCreditNotesNum / total) * 100 },
          { color: "#000000", percentage: (totalBalancesNum / total) * 100 }
        ]
      : [];

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
        value={`-${totalCreditNotes}`}
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
