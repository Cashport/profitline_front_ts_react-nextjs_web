"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message, Tabs } from "antd";
import type { TabsProps } from "antd";

import { signInWithCustomToken } from "@firebase/auth";
import { auth } from "../../../../../firebase";

import { getClientWallet } from "@/services/clients/clients";

import TotalDebtCard from "../../components/TotalDebtCard/TotalDebtCard";
import PendingInvoicesTab from "../tabs/PendingInvoicesTab/PendingInvoicesTab";
import CreditBalancesTab from "../tabs/CreditBalancesTab/CreditBalancesTab";
import MyPaymentsTab from "../tabs/MyPaymentsTab/MyPaymentsTab";

import { CreditBalance, CreditBalanceFormated, IClientWalletData, InvoiceFormated } from "@/types/clients/IClients";

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

const getInvoiceStatus = (
  expirationDate: string,
  estado: string
): "overdue" | "dueToday" | "dueTomorrow" | "normal" => {
  if (estado === "Vencida") return "overdue";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const expDate = new Date(expirationDate);
  // Adjust for timezone if necessary, but assuming local date or UTC consistent
  // If expirationDate is ISO string with time, we strip time.
  // If it's YYYY-MM-DD, new Date() might treat as UTC.
  // To be safe with "today", we should probably use UTC or local consistently.
  // Assuming simple comparison for now.
  // However, new Date("2025-06-03") is UTC, new Date() is local.
  // Let's try to be consistent.
  // If expirationDate is "2025-06-03T00:00:00", it works.
  
  // A safer way for "today" check without timezone issues if we only care about date part:
  const exp = new Date(expirationDate);
  const t = new Date();
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(exp, t)) return "dueToday";
  
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  if (isSameDay(exp, tmr)) return "dueTomorrow";

  return "normal";
};

// Helper function to map API invoice data to component format
const mapPendingInvoices = (listadoFacturas?: IClientWalletData["invoices_list"]): InvoiceFormated[] => {
  if (!listadoFacturas) return [];
  return listadoFacturas?.map((factura, index) => ({
    id: (index + 1).toString(),
    code: factura.invoice,
    date: formatDate(factura.expiration_date),
    amount: factura.value,
    status: factura.status as any,
    formattedAmount: formatCurrencyMoney(factura.value),
    isPastDue: factura.status === "Vencida",
  }));
};

// Helper function to map API credit balance data to component format
const mapCreditBalances = (saldosAFavor?: CreditBalance[]): CreditBalanceFormated[] => {
  if (!saldosAFavor) return [];
  return saldosAFavor.map((saldo, index) => ({
    id: (index + 1).toString(),
    description: saldo.reason || "Saldo a favor",
    date: saldo.creation_date ? formatDate(saldo.creation_date) : "",
    formattedAmount: formatCurrencyMoney(saldo.value || 0)
  }));
};

const CashportMobileView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsToken = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IClientWalletData | null>(null);

  useEffect(() => {
    if (paramsToken) {
      signInAndGetWallet(paramsToken);
    } else {
      message.error("Token no proporcionado");
      setError("Token no proporcionado");
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
        setError("El enlace de acceso ha caducado o es inválido. Por favor, solicite uno nuevo.");
      } else {
        setError("Ocurrió un error al cargar la información. Por favor intente nuevamente.");
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
      label: "Facturas pendientes",
      children: (
        <PendingInvoicesTab
          pendingInvoices={data ? mapPendingInvoices(data.invoices_list) : []}
        />
      )
    },
    {
      key: "credit-balances",
      label: "Saldos a favor",
      children: (
        <CreditBalancesTab
          creditBalances={data ? mapCreditBalances(data.credit_balances) : []}
        />
      )
    },
    {
      key: "my-payments",
      label: "Mis pagos",
      children: <MyPaymentsTab availablePayments={data?.payments.length ? data.payments : []} />
    }
  ];

  const handlePay = () => {
    const token = paramsToken ? encodeURIComponent(paramsToken as string) : "";
    const paymentLink = data?.payment_link ? encodeURIComponent(data.payment_link) : "";

    router.push(`/mobile/confirmPayment?token=${token}&payment_link=${paymentLink}`);
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
