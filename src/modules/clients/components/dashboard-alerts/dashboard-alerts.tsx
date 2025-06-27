import { FC } from "react";
import DashboardGenericItem from "../dashboard-generic-item";
import styles from "./dashboard-alerts.module.scss";

interface DashboardAlertsProps {
  openAlerts: string;
  openAlertsCount: number | undefined;
  creditNotes: string;
  creditNotesCount: number | undefined;
  totalBalance: string;
  totalBalanceCount: number | undefined;
  className?: string;
}


const DashboardAlerts: FC<DashboardAlertsProps> = ({
  openAlerts,
  openAlertsCount,
  totalBalance,
  totalBalanceCount,
  creditNotes,
  creditNotesCount,
  className
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>Alertas</div>
      <div className={styles.list}>
        <DashboardGenericItem
          name="Novedades abiertas"
          value={openAlerts}
          unit="M"
          quantity={openAlertsCount}
        />
        <DashboardGenericItem
          name="Saldos"
          value={totalBalance}
          unit="M"
          quantity={totalBalanceCount}
        />
        <DashboardGenericItem
          name="NC disponibles"
          value={creditNotes}
          unit="M"
          quantity={creditNotesCount}
        />
      </div>
    </div>
  );
};

export default DashboardAlerts;
