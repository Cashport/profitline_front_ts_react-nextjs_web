"use client";
import React from "react";
import { Tabs, Typography } from "antd";
import type { TabsProps } from "antd";

import TotalDebtCard from "./components/TotalDebtCard/TotalDebtCard";

import "./cashportMobile.scss";
import PendingInvoiceCard from "./components/PendingInvoiceCard/PendingInvoiceCard";

const { Text } = Typography;

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

const CashportMobile: React.FC = () => {
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

  const renderInvoiceItem = (invoice: Invoice) => (
    <PendingInvoiceCard
      key={invoice.id}
      invoice={{
        id: invoice.id,
        code: invoice.code,
        date: invoice.date,
        isPastDue: invoice.isPastDue || false,
        formattedAmount: invoice.formattedAmount,
        formattedOriginalAmount: invoice.formattedOriginalAmount
      }}
    />
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "pending",
      label: "Facturas pendientes",
      children: (
        <div className="cashport-mobile__invoices-list">
          {pendingInvoices.map(renderInvoiceItem)}
        </div>
      )
    },
    {
      key: "my-payments",
      label: "Mis pagos",
      children: (
        <div className="cashport-mobile__payments-empty">
          <Text>No hay pagos registrados</Text>
        </div>
      )
    }
  ];

  return (
    <div className="cashport-mobile">
      <TotalDebtCard totalDebt={totalDebt} readyToPay={readyToPay} onPay={() => {}} />

      <div className="cashport-mobile__tabs-section">
        <Tabs
          defaultActiveKey="pending"
          items={tabItems}
          className="cashport-mobile__tabs"
          renderTabBar={(props, DefaultTabBar) => (
            <DefaultTabBar {...props} className="cashport-mobile__custom-tab-bar" />
          )}
        />
      </div>
    </div>
  );
};

export default CashportMobile;
