import { FC } from "react";
import { useTranslations } from "use-intl";
import DashboardGenericItem from "../dashboard-generic-item";
import styles from "./dashboard-invoice-status.module.scss";

interface DashboardInvoiceStatusProps {
  totalUnreconciled: string;
  totalUnreconciledCount: number | undefined;
  totalReconciled: string;
  totalReconciledCount: number | undefined;
  sinRadicarValue: string;
  sinRadicarCount: number | undefined;
  className?: string;
}

const DashboardInvoiceStatus: FC<DashboardInvoiceStatusProps> = ({
  totalUnreconciled,
  totalUnreconciledCount,
  totalReconciled,
  totalReconciledCount,
  sinRadicarValue,
  sinRadicarCount,
  className
}) => {
  const t = useTranslations("clients.dashboard.invoiceStatus");
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>{t("title")}</div>
      <div className={styles.list}>
        <DashboardGenericItem
          name={t("unreconciled")}
          value={totalUnreconciled}
          unit="M"
          quantity={totalUnreconciledCount}
        />
        <DashboardGenericItem
          name={t("reconciled")}
          value={totalReconciled}
          unit="M"
          quantity={totalReconciledCount}
        />
        <DashboardGenericItem
          name={t("notSubmitted")}
          value={sinRadicarValue}
          unit="M"
          quantity={sinRadicarCount}
        />
      </div>
    </div>
  );
};

export default DashboardInvoiceStatus;
