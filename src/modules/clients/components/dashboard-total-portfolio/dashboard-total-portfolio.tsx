import { FC } from "react";
import Image from "next/image";
import DashboardGenericItem from "../dashboard-generic-item";
import DashboardColorBar from "../dashboard-color-bar";

import styles from "./dashboard-total-portfolio.module.scss";

interface DashboardTotalPortfolioProps {
  totalWallet: string;
  className?: string;
}

const DashboardTotalPortfolio: FC<DashboardTotalPortfolioProps> = ({ totalWallet, className }) => {
  const colorBarValues = [
    { color: "#cbe71e", percentage: 50 },
    { color: "#9ab916", percentage: 30 },
    { color: "#000000", percentage: 20 },
  ];

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <DashboardGenericItem name="Total cartera neta" value={totalWallet} unit="M" />

      <DashboardColorBar values={colorBarValues} />

      <DashboardGenericItem
        name="Facturas"
        value={"1.234"}
        unit="M"
        quantity={123}
        color="#cbe71e"
      />

      <DashboardGenericItem
        name="Notas crédito"
        value={"1.234"}
        unit="M"
        quantity={123}
        color="green"
      />

      <DashboardGenericItem name="Saldos" value={"1.234"} unit="M" quantity={123} color="black" />
    </div>
  );
};

export default DashboardTotalPortfolio;
