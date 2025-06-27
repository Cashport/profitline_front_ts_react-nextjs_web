import { FC } from "react";
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
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>Estatus de facturas</div>
      <div className={styles.list}>
        <DashboardGenericItem
          name="Sin conciliar"
          value={totalUnreconciled}
          unit="M"
          quantity={totalUnreconciledCount}
        />
        <DashboardGenericItem
          name="Conciliadas"
          value={totalReconciled}
          unit="M"
          quantity={totalReconciledCount}
        />
        <DashboardGenericItem
          name="Sin radicar"
          value={sinRadicarValue}
          unit="M"
          quantity={sinRadicarCount}
        />
      </div>
    </div>
  );
};

export default DashboardInvoiceStatus;
