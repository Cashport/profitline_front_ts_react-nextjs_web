import { FC, useContext } from "react";
import dynamic from "next/dynamic";

import DashboardTotalPortfolio from "../../components/dashboard-total-portfolio";
import DashboardGenericItem from "../../components/dashboard-generic-item";
import DashboardSellsVsPayments from "../../components/dashboard-sells-vs-payments";
import DashboardHistoricDso from "../../components/dashboard-historic-dso";
import { ClientDetailsContext } from "@/modules/clients/contexts/client-details-context";
import { useDashboardInfo } from "@/components/hooks/useDashboardInfo";
import DashboardCollectApply from "../../components/dashboard-collect-apply";

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
    invoiceAges,
    totalUnreconciled,
    totalUnreconciledCount,
    openAlerts,
    openAlertsCount,
    appliedPayments,
    unappliedPayments,
    quota,
    quotaPercentage,
    dsoValue,
    sellsVsPaymentsData,
    history_dso,
    totalInvoices,
    countInvoices,
    totalBalancesNew,
    countBalancesNew,
    totalCreditNotes,
    countCreditNotes,
    collection,
    unidentifiedPayments
  } = useDashboardInfo(portfolioData);

  return (
    <div className={styles.wrapper}>
      <div className={styles.a}>
        <DashboardTotalPortfolio
          className={styles.card}
          totalWallet={totalWallet}
          totalInvoices={totalInvoices}
          countInvoices={countInvoices}
          totalCreditNotes={totalCreditNotes}
          countCreditNotes={countCreditNotes}
          totalBalances={totalBalancesNew}
          countBalances={countBalancesNew}
        />
        <DynamicPortfoliAges
          className={`${styles.card} ${styles.portfolioAges}`}
          invoiceAges={invoiceAges}
          pastDuePortfolio={pastDuePortfolio}
        />
        <DashboardCollectApply
          className={styles.card}
          collection={collection}
          totalApplied={appliedPayments}
          pendingApplication={unappliedPayments}
          unidentifiedPayments={unidentifiedPayments}
        />
      </div>
      <div className={styles.b}>
        <div className={styles.card}>
          <DashboardGenericItem
            name="Cupo"
            value={quota}
            unit="M"
            badgeText={`${parseFloat(quotaPercentage).toFixed(1)}%`}
          />
        </div>
        <div className={styles.card}>
          <DashboardGenericItem
            name="Sin conciliar"
            value={totalUnreconciled}
            unit="M"
            quantity={totalUnreconciledCount}
          />
          <DashboardGenericItem
            name="Novedades"
            value={openAlerts}
            unit="M"
            quantity={openAlertsCount}
          />
        </div>
        <div className={styles.dso}>
          <div className={styles.label}>DSO</div>
          <div className={styles.value}>{dsoValue}</div>
        </div>
      </div>
      <div className={styles.c}>
        <DashboardSellsVsPayments className={styles.card} chartData={sellsVsPaymentsData} />
        <DashboardHistoricDso className={styles.card} history_dso={history_dso} />
      </div>
    </div>
  );
};

export default Dashboard;
