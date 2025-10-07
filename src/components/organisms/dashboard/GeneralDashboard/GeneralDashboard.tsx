import { FC } from "react";
import dynamic from "next/dynamic";
import { useDashboardInfo } from "@/components/hooks/useDashboardInfo";

import DashboardTotalPortfolio from "@/modules/clients/components/dashboard-total-portfolio";
import DashboardGenericItem from "@/modules/clients/components/dashboard-generic-item";
import DashboardSellsVsPayments from "@/modules/clients/components/dashboard-sells-vs-payments";
import DashboardHistoricDso from "@/modules/clients/components/dashboard-historic-dso";
import DashboardCollectApply from "@/modules/clients/components/dashboard-collect-apply";

import { IDataSection } from "@/types/portfolios/IPortfolios";

import styles from "./generalDashboard.module.scss";

const DynamicPortfoliAges = dynamic(
  () => import("../../../../modules/clients/components/dashboard-porfolio-ages"),
  {
    ssr: false
  }
);

interface GeneralDashboardViewProps {
  portfolioData: IDataSection | undefined;
}

const GeneralDashboard: FC<GeneralDashboardViewProps> = ({ portfolioData }) => {
  const {
    totalWallet,
    pastDuePortfolio,
    invoiceAges,
    totalUnreconciled,
    totalUnreconciledCount,
    totalBalance,
    totalBalanceCount,
    openAlerts,
    openAlertsCount,
    creditNotes,
    creditNotesCount,
    quota,
    quotaPercentage,
    dsoValue,
    sellsVsPaymentsData,
    history_dso,
  } = useDashboardInfo(portfolioData);

  return (
    <>
      {portfolioData ? (
        <div className={styles.wrapper}>
          <div className={styles.a}>
            <DashboardTotalPortfolio
              className={styles.card}
              totalWallet={totalWallet}
              totalCreditNotes={creditNotes}
              countCreditNotes={creditNotesCount}
              totalBalances={totalBalance}
              countBalances={totalBalanceCount}
            />
            <DynamicPortfoliAges
              className={`${styles.card} ${styles.portfolioAges}`}
              invoiceAges={invoiceAges}
              pastDuePortfolio={pastDuePortfolio}
            />
            <DashboardCollectApply className={styles.card} />
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
      ) : null}
    </>
  );
};

export default GeneralDashboard;
