"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

import { signInWithCustomToken } from "@firebase/auth";
import { auth } from "../../../../../firebase";

import { getClientWallet, getMobileToken } from "@/services/clients/clients";

import TotalDebtCard from "../../components/TotalDebtCard/TotalDebtCard";
import PendingInvoicesTab from "../tabs/PendingInvoicesTab/PendingInvoicesTab";
import MyPaymentsTab from "../tabs/MyPaymentsTab/MyPaymentsTab";

import { IClientWalletData } from "@/types/clients/IClients";

import "./cashportMobileView.scss";

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
  // const clientID = searchParams.get("id");
  const clientID = "57aefbf0568311f09abb06e6795ff363"; // Temporary hardcoded client ID for testing
  const [data, setData] = useState<IClientWalletData | null>(null);

  useEffect(() => {
    if (clientID) {
      fetchToken(clientID);
    }
  }, [clientID]);

  const fetchToken = async (id: string) => {
    try {
      // After testing this will be removed because token will arrive on the url
      const token = await getMobileToken(id);
      try {
        const res = await signInWithCustomToken(auth, token);
        const idToken = await res.user.getIdToken();
        console.log("User will use token:", idToken);

        try {
          const walletData = await getClientWallet(idToken);
          setData(walletData);
        } catch (error) {
          console.error("Error fetching client wallet:", error);
        }
      } catch (error) {
        console.error("Error signing in with custom token:", error);
      }
    } catch (error) {
      console.error("Error fetching mobile token:", error);
    }
  };

  const pendingInvoices: Invoice[] = [
    {
      id: "1",
      code: "VT-22214",
      date: "Jun 3, 2025",
      amount: 288000,
      formattedAmount: "288.000",
      isPastDue: true
    },
    {
      id: "2",
      code: "VT-222766",
      date: "Jun 3, 2025",
      amount: 14900690,
      formattedAmount: "14.900.690",
      originalAmount: 16556323,
      formattedOriginalAmount: "16.556.323"
    },
    {
      id: "3",
      code: "VT-223045",
      date: "Jun 3, 2025",
      amount: 14078700,
      formattedAmount: "14.078.700",
      originalAmount: 15643000,
      formattedOriginalAmount: "15.643.000"
    }
  ];

  const creditBalances = [
    {
      id: "1",
      description: "Devolución de producto",
      date: "Jun 3, 2025",
      formattedAmount: "1.000.000"
    },
    {
      id: "2",
      description: "Producto dañado",
      date: "Jun 1, 2025",
      formattedAmount: "500.000"
    }
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "pending",
      label: "Facturas pendientes",
      children: (
        <PendingInvoicesTab
          pendingInvoices={data ? mapPendingInvoices(data.listado_facturas) : pendingInvoices}
          creditBalances={data ? mapCreditBalances(data.saldos_a_favor) : creditBalances}
        />
      )
    },
    {
      key: "my-payments",
      label: "Mis pagos",
      children: <MyPaymentsTab availablePayments={creditBalances} />
    }
  ];

  const handlePay = () => {
    console.log("Initiating payment...");
    // a push to host/mobile/confirmPayment
    router.push("/mobile/confirmPayment");
  };

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
