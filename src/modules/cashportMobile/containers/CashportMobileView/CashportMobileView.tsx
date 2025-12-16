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
import MyPaymentsTab from "../tabs/MyPaymentsTab/MyPaymentsTab";

import { IClientWalletData } from "@/types/clients/IClients";

import "./cashportMobileView.scss";
import MobileLoader from "../../components/Loader/MobileLoader";
import ErrorMobile from "../../components/ErrorView/ErrorMobile";

interface Invoice {
  id: string;
  code: string;
  date: string;
  amount: number;
  formattedAmount: string;
  originalAmount?: number;
  formattedOriginalAmount?: string;
  isPastDue?: boolean;
}

interface CreditBalance {
  id: string;
  description: string;
  date: string;
  formattedAmount: string;
}

// Helper function to format currency
const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return "0";
  return value.toLocaleString("es-CO");
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

// Helper function to map API invoice data to component format
const mapPendingInvoices = (listadoFacturas?: IClientWalletData["listado_facturas"]): Invoice[] => {
  if (!listadoFacturas) return [];
  return listadoFacturas?.map((factura, index) => ({
    id: (index + 1).toString(),
    code: factura.factura,
    date: formatDate(factura.expiration_date),
    amount: factura.valor,
    formattedAmount: formatCurrency(factura.valor),
    isPastDue: factura.estado === "Vencida"
  }));
};

// Helper function to map API credit balance data to component format
const mapCreditBalances = (saldosAFavor?: any[]): CreditBalance[] => {
  if (!saldosAFavor) return [];
  return saldosAFavor.map((saldo, index) => ({
    id: (index + 1).toString(),
    description: saldo.description || "Saldo a favor",
    date: saldo.date ? formatDate(saldo.date) : "",
    formattedAmount: formatCurrency(saldo.amount || 0)
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
          pendingInvoices={data ? mapPendingInvoices(data.listado_facturas) : []}
          creditBalances={data ? mapCreditBalances(data.saldos_a_favor) : []}
        />
      )
    },
    {
      key: "my-payments",
      label: "Mis pagos",
      disabled: true,
      children: <MyPaymentsTab availablePayments={[]} />
    }
  ];

  const handlePay = () => {
    console.log("Initiating payment...");
    // a push to host/mobile/confirmPayment
    router.push("/mobile/confirmPayment");
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
        totalDebt={data?.deuda_total || 0}
        readyToPay={data?.descuento_pronto_pago || 0}
        onPay={handlePay}
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
