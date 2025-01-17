import dayjs from "dayjs";

import { useAppStore } from "@/lib/store/store";
import { formatMillionNumber, capitalize } from "@/utils/utils";

import { IDataSection } from "@/types/portfolios/IPortfolios";

export const useDashboardInfo = (portfolioData: IDataSection | undefined) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  // Total Portfolio
  const formattedTotalWallet = formatMillionNumber(portfolioData?.total_wallet);
  const totalWallet = formatMoney(formattedTotalWallet);

  // Expired Portfolio
  const formattedPastDuePortfolio = formatMillionNumber(
    portfolioData?.data_wallet?.past_due_ammount
  );
  const pastDuePortfolio = formatMoney(formattedPastDuePortfolio);
  const expiredPercentage = portfolioData?.percentages?.past_due_percentage || "0";

  // Budget
  const formattedBudget = formatMillionNumber(portfolioData?.data_wallet?.budget_ammount);
  const budget = formatMoney(formattedBudget);

  // Portfolio Ages
  const invoiceAges = portfolioData?.invoice_ages
    ?.map((item) => {
      const dataKey = item.total > 0 ? [item.total] : [item.total];

      return {
        name: item.days_range,
        data: dataKey
      };
    })
    .reverse();

  // Invoice Status
  const formattedTotalUnreconciled = formatMillionNumber(
    portfolioData?.info_invioce?.total_invoice_unreconciled?.total_value
  );
  const totalUnreconciled = formatMoney(formattedTotalUnreconciled);
  const totalUnreconciledCount = portfolioData?.info_invioce?.total_invoice_unreconciled?.count;

  const formattedTotalReconciled = formatMillionNumber(
    portfolioData?.info_invioce?.total_invoice_reconciled?.total_value
  );
  const totalReconciled = formatMoney(formattedTotalReconciled);
  const totalReconciledCount = portfolioData?.info_invioce?.total_invoice_reconciled?.count;

  const formattedTotalBalance = formatMillionNumber(
    portfolioData?.info_invioce?.total_balances?.total_value
  );
  const totalBalance = formatMoney(formattedTotalBalance);
  const totalBalanceCount = portfolioData?.info_invioce?.total_balances?.count;

  // Alerts
  const formattedOpenAlerts = formatMillionNumber(
    portfolioData?.invoice_alerts?.accounting_updates?.total_value
  );
  const openAlerts = formatMoney(formattedOpenAlerts);
  const openAlertsCount = portfolioData?.invoice_alerts?.accounting_updates?.count;
  const formattedDiscounts = formatMillionNumber(
    portfolioData?.invoice_alerts?.financial_discounts?.discount.total_value
  );
  const discount = formatMoney(formattedDiscounts);
  const discountCount = portfolioData?.invoice_alerts?.financial_discounts?.discount.count;
  const formattedCreditNotes = formatMillionNumber(
    portfolioData?.invoice_alerts?.financial_discounts?.creditNote.total_value
  );
  const creditNotes = formatMoney(formattedCreditNotes);
  const creditNotesCount = portfolioData?.invoice_alerts?.financial_discounts?.creditNote.count;

  // Sells vs Payments
  const uniqueItemsMap = new Map();

  portfolioData?.payments_vs_invoices?.forEach((item) => {
    const name = capitalize(dayjs(item.month).utc().locale("es").format("MMM YY"));
    uniqueItemsMap.set(name, item);
  });

  const sellsVsPaymentsData = Array.from(uniqueItemsMap?.values())?.map((item) => {
    return {
      name: capitalize(dayjs(item.month).utc().locale("es").format("MMM YY")),
      ventas: item.sales,
      pagos: item.payments
    };
  });

  // Historic DSO
  const history_dso = portfolioData?.payments_vs_invoices?.map((month) => ({
    dso: month.dso,
    date: month.month
  }));

  const formattedAppliedPayments = formatMillionNumber(
    portfolioData?.data_wallet?.applied_payments_ammount
  );
  const appliedPayments = formatMoney(formattedAppliedPayments);
  const appliedPaymentPercentage = portfolioData?.percentages?.applied_payments_percentage;

  const formattedUnappliedPayments = formatMillionNumber(
    portfolioData?.data_wallet?.unapplied_payments_ammount
  );
  const unappliedPayments = formatMoney(formattedUnappliedPayments);
  const unnappliedPaymentPercentage = portfolioData?.percentages?.unapplied_payments_percentage;

  const dsoValue = portfolioData?.dso;

  const formattedQuota = formatMillionNumber(portfolioData?.quota);
  const quota = formatMoney(formattedQuota);
  const quotaPercentage = portfolioData?.percentages?.quota_percentage || "0";

  return {
    totalWallet,
    pastDuePortfolio,
    expiredPercentage,
    budget,
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
    sellsVsPaymentsData,
    history_dso,
    appliedPayments,
    appliedPaymentPercentage,
    unappliedPayments,
    unnappliedPaymentPercentage,
    dsoValue,
    quota,
    quotaPercentage
  };
};
