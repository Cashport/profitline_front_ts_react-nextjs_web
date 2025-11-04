"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

import TotalDebtCard from "../../components/TotalDebtCard/TotalDebtCard";
import PendingInvoicesTab from "../tabs/PendingInvoicesTab/PendingInvoicesTab";
import MyPaymentsTab from "../tabs/MyPaymentsTab/MyPaymentsTab";

import "./cashportMobileView.scss";
import { getClientWallet, getMobileToken } from "@/services/clients/clients";
import { signInWithCustomToken } from "@firebase/auth";
import { auth } from "../../../../../firebase";

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

const CashportMobileView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const clientID = searchParams.get("id");
  const clientID = "57aefbf0568311f09abb06e6795ff363"; // Temporary hardcoded client ID for testing

  useEffect(() => {
    if (clientID) {
      fetchToken(clientID);
    }
  }, [clientID]);

  const fetchToken = async (id: string) => {
    try {
      // Call the service to get the mobile token
      console.log("fetching with", id);
      const token = await getMobileToken(id);
      console.log("Mobile token fetched successfully:", token);

      try {
        const res = await signInWithCustomToken(auth, token);
        console.log("res", res);
      } catch (error) {
        console.error("Error fetching client wallet:", error);
      }
    } catch (error) {
      console.error("Error fetching mobile token:", error);
    }
  };

  // Mock data
  const totalDebt = 32487323;
  const readyToPay = 29267390;

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
        <PendingInvoicesTab pendingInvoices={pendingInvoices} creditBalances={creditBalances} />
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
      <TotalDebtCard totalDebt={totalDebt} readyToPay={readyToPay} onPay={handlePay} />

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
