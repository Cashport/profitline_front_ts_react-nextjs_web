"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { message, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "use-intl";

import { signInWithCustomToken } from "@firebase/auth";
import { auth } from "../../../../../firebase";

import { getClientWallet } from "@/services/clients/clients";

import TotalDebtCard from "../../components/TotalDebtCard/TotalDebtCard";
import PendingInvoicesTab from "../tabs/PendingInvoicesTab/PendingInvoicesTab";
import CreditBalancesTab from "../tabs/CreditBalancesTab/CreditBalancesTab";
import MyPaymentsTab from "../tabs/MyPaymentsTab/MyPaymentsTab";

import {
  CreditBalance,
  CreditBalanceFormated,
  IClientWalletData,
  InvoiceFormated
} from "@/types/clients/IClients";

import "./cashportMobileView.scss";
import MobileLoader from "../../components/Loader/MobileLoader";
import ErrorMobile from "../../components/ErrorView/ErrorMobile";
import { formatCurrencyMoney } from "@/utils/utils";

// Helper function to format date
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

// Helper function to map API invoice data to component format
const mapPendingInvoices = (
  listadoFacturas?: IClientWalletData["invoices_list"]
): InvoiceFormated[] => {
  if (!listadoFacturas) return [];
  return listadoFacturas?.map((factura, index) => ({
    id: (index + 1).toString(),
    code: factura.invoice,
    date: formatDate(factura.expiration_date),
    amount: factura.value,
    status: factura.status as any,
    formattedAmount: formatCurrencyMoney(factura.value),
    isPastDue: factura.status === "Vencida"
  }));
};

// Helper function to map API credit balance data to component format
const mapCreditBalances = (
  fallbackDescription: string,
  saldosAFavor?: CreditBalance[]
): CreditBalanceFormated[] => {
  if (!saldosAFavor) return [];
  return saldosAFavor.map((saldo, index) => ({
    id: (index + 1).toString(),
    description: saldo.reason || fallbackDescription,
    date: saldo.creation_date ? formatDate(saldo.creation_date) : "",
    formattedAmount: formatCurrencyMoney(saldo.value || 0)
  }));
};

const CashportMobileView: React.FC = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("publicPortals.mobile.home");
  const paramsToken = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IClientWalletData | null>(null);

  useEffect(() => {
    if (paramsToken) {
      signInAndGetWallet(paramsToken);
    } else {
      message.error(t("missingToken"));
      setError(t("missingToken"));
      setLoading(false);
    }
  }, [paramsToken]);

  const signInAndGetWallet = async (paramsToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithCustomToken(auth, paramsToken);
      const idToken = await res.user.getIdToken();
      const walletData = await getClientWallet(idToken);
      setData(walletData);
    } catch (error: any) {
      console.error("Error in signInAndGetWallet:", error);
      if (error?.code === "auth/invalid-custom-token") {
        setError(t("expiredLink"));
      } else {
        setError(t("loadError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const _handleRetry = () => {
    if (paramsToken) {
      signInAndGetWallet(paramsToken);
    }
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "pending",
      label: t("tabs.pendingInvoices"),
      children: (
        <PendingInvoicesTab pendingInvoices={data ? mapPendingInvoices(data.invoices_list) : []} />
      )
    },
    {
      key: "credit-balances",
      label: t("tabs.creditBalances"),
      children: (
        <CreditBalancesTab
          creditBalances={data ? mapCreditBalances(t("creditBalance"), data.credit_balances) : []}
        />
      )
    },
    {
      key: "my-payments",
      label: t("tabs.myPayments"),
      children: <MyPaymentsTab availablePayments={data?.payments.length ? data.payments : []} />
    }
  ];

  const handlePay = () => {
    if (!data?.payment_link) {
      message.error(t("payError"));
      return;
    }

    window.location.href = data.payment_link;
  };

  if (loading) {
    return <MobileLoader></MobileLoader>;
  }

  if (error) {
    return <ErrorMobile message={error} />;
  }

  return (
    <div className="cashportMobileView">
      <TotalDebtCard
        totalDebt={data?.total_debt || 0}
        readyToPay={data?.total_to_pay || 0}
        ppToPay={data?.early_payment_discount || 0}
        onPay={data?.total_to_pay ? handlePay : undefined}
      />

      <div className="cashportMobileView__tabs-section">
        <Tabs
          defaultActiveKey="pending"
          centered
          items={tabItems}
          className="cashportMobileView__tabs"
          renderTabBar={(props, DefaultTabBar) => (
            <DefaultTabBar {...props} className="cashportMobileView__custom-tab-bar" />
          )}
        />
      </div>
    </div>
  );
};

export default CashportMobileView;
