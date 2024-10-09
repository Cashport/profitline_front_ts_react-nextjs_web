import { FC } from "react";
import Image from "next/image";
import styles from "./dashboard-budget.module.scss";
import DashboardGenericItem from "../dashboard-generic-item";

interface DashboardBudgetProps {
  budget: string;
  className?: string;
}

const DashboardBudget: FC<DashboardBudgetProps> = ({ budget, className }) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <DashboardGenericItem name="Presupuesto" value={budget} unit="M" />
      <Image src="/images/graph-3.svg" alt="Graph" className={styles.img} width={86} height={56} />
    </div>
  );
};

export default DashboardBudget;
