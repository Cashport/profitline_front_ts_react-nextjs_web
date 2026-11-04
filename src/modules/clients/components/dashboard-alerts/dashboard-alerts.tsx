import { FC } from "react";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("clients.dashboard.alerts");
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>{t("title")}</div>
      <div className={styles.list}>
        <DashboardGenericItem
          name={t("openDisputes")}
          value={openAlerts}
          unit="M"
          quantity={openAlertsCount}
        />
        <DashboardGenericItem
          name={t("balances")}
          value={totalBalance}
          unit="M"
          quantity={totalBalanceCount}
        />
        <DashboardGenericItem
          name={t("availableCreditMemos")}
          value={creditNotes}
          unit="M"
          quantity={creditNotesCount}
        />
      </div>
    </div>
  );
};

export default DashboardAlerts;
