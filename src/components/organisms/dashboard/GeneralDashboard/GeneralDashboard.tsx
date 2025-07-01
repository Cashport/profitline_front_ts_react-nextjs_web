import { FC } from "react";
import dynamic from "next/dynamic";
import { useDashboardInfo } from "@/components/hooks/useDashboardInfo";
import { useAppStore } from "@/lib/store/store";

import DashboardTotalPortfolio from "@/modules/clients/components/dashboard-total-portfolio";
import DashboardExpiredPortfolio from "@/modules/clients/components/dashboard-expired-portfolio";
import DashboardBudget from "@/modules/clients/components/dashboard-budget";
import DashboardInvoiceStatus from "@/modules/clients/components/dashboard-invoice-status";
import DashboardAlerts from "@/modules/clients/components/dashboard-alerts";
import DashboardGenericItem from "@/modules/clients/components/dashboard-generic-item";
import DashboardSellsVsPayments from "@/modules/clients/components/dashboard-sells-vs-payments";
import DashboardHistoricDso from "@/modules/clients/components/dashboard-historic-dso";

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
  const formatMoney = useAppStore((state) => state.formatMoney);

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
    appliedPaymentPercentage,
    unappliedPayments,
    unnappliedPaymentPercentage,
    quota,
    quotaPercentage,
    dsoValue,
    sellsVsPaymentsData,
    history_dso,
    sinRadicarValue,
    sinRadicarCount,
  } = useDashboardInfo(portfolioData);

  return (
    <>
      {portfolioData ? (
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
            <DashboardHistoricDso
              className={`${styles.item} ${styles.historicDso}`}
              history_dso={history_dso}
              yAxisLabelFormatter={(value) =>
                value > 1000000 || value < -1000000
                  ? formatMoney(value, { hideCurrencySymbol: true, scale: 6 }) + "MM"
                  : formatMoney(value, { hideCurrencySymbol: true })
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GeneralDashboard;
