import { FC, useContext } from "react";
import dynamic from "next/dynamic";

import DashboardTotalPortfolio from "../../components/dashboard-total-portfolio";
import DashboardExpiredPortfolio from "../../components/dashboard-expired-portfolio";
import DashboardBudget from "../../components/dashboard-budget";
import DashboardInvoiceStatus from "../../components/dashboard-invoice-status";
import DashboardAlerts from "../../components/dashboard-alerts";
import DashboardGenericItem from "../../components/dashboard-generic-item";
import DashboardSellsVsPayments from "../../components/dashboard-sells-vs-payments";
import DashboardHistoricDso from "../../components/dashboard-historic-dso";
import { ClientDetailsContext } from "../client-details/client-details";
import { useDashboardInfo } from "@/components/hooks/useDashboardInfo";

import styles from "./dashboard.module.scss";

const DynamicPortfoliAges = dynamic(() => import("../../components/dashboard-porfolio-ages"), {
  ssr: false
});

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const { portfolioData } = useContext(ClientDetailsContext);

  const {
    totalWallet,
    pastDuePortfolio,
    expiredPercentage,
    budget,
    budgetPercentage,
    invoiceAges,
    totalUnreconciled,
    totalUnreconciledCount,
    totalReconciled,
    totalReconciledCount,
    totalBalance,
    totalBalanceCount,
    openAlerts,
    openAlertsCount,
    discount,
    discountCount,
    creditNotes,
    creditNotesCount,
    appliedPayments,
    unappliedPayments,
    quota,
    quotaPercentage,
    dsoValue,
    sellsVsPaymentsData,
    history_dso,
    sinRadicarValue,
    sinRadicarCount
  } = useDashboardInfo(portfolioData);

  return (
    <div className={styles.wrapper}>
      <div className={styles.a}>
        <DashboardTotalPortfolio className={styles.item} totalWallet={totalWallet} />
        <DashboardExpiredPortfolio
          className={styles.item}
          pastDuePortfolio={pastDuePortfolio}
          expiredPercentage={expiredPercentage}
        />
        <DashboardBudget
          className={styles.item}
          budget={budget}
          budgetPercentage={budgetPercentage}
        />
        <DynamicPortfoliAges className={styles.item} invoiceAges={invoiceAges} />
        <DashboardInvoiceStatus
          className={styles.item}
          totalUnreconciled={totalUnreconciled}
          totalUnreconciledCount={totalUnreconciledCount}
          totalReconciled={totalReconciled}
          totalReconciledCount={totalReconciledCount}
          sinRadicarValue={sinRadicarValue}
          sinRadicarCount={sinRadicarCount}
        />
        <DashboardAlerts
          className={styles.item}
          openAlerts={openAlerts}
          openAlertsCount={openAlertsCount}
          creditNotes={creditNotes}
          creditNotesCount={creditNotesCount}
          totalBalance={totalBalance}
          totalBalanceCount={totalBalanceCount}
        />
      </div>
      <div className={styles.b}>
        <div className={styles.item}>
          <div className={styles.list}>
            <DashboardGenericItem
              name="R. aplicado"
              value={appliedPayments}
              unit="M"
            />
            <DashboardGenericItem
              name="Pagos no ap."
              value={unappliedPayments}
              unit="M"
            />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.list}>
            <DashboardGenericItem
              name="Cupo"
              value={quota}
              unit="M"
              badgeText={`${parseFloat(quotaPercentage).toFixed(1)}%`}
            />
          </div>
        </div>
        <div className={styles.dso}>
          <div className={styles.label}>DSO</div>
          <div className={styles.value}>{dsoValue}</div>
        </div>
      </div>
      <div className={styles.c}>
        <DashboardSellsVsPayments className={styles.item} chartData={sellsVsPaymentsData} />
        <DashboardHistoricDso className={styles.item} history_dso={history_dso} />
      </div>
    </div>
  );
};

export default Dashboard;
