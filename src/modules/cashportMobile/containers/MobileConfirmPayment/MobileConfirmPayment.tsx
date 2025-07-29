"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";

import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PendingInvoiceCard from "../../components/PendingInvoiceCard/PendingInvoiceCard";
import PaymentSummaryCard from "../../components/PaymentSummaryCard/PaymentSummaryCard";

import "./mobileConfirmPayment.scss";
import { PencilSimpleLine } from "@phosphor-icons/react";

const MobileConfirmPayment: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    console.log("Going back");
    router.push("/mobile");
  };

  return (
    <MobileNavBar title={"Detalles del pago"} onBack={handleGoBack}>
      <Flex vertical gap={"2rem"} className="mobileConfirmPayment">
        <PaymentSummaryCard billed={288000} discount={10000} total={278000} />

        <Flex vertical gap="1rem">
          <h4 className="mobileConfirmPayment__title">Facturas incluidas</h4>

          <Flex vertical gap="0.5rem">
            {pendingInvoices.map((invoice) => (
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
                onClick={() => console.log(invoice.id)}
                isInteractive={false}
              />
            ))}
          </Flex>

          <button className="mobileConfirmPayment__modifyButton">
            Modificar pago
            <PencilSimpleLine size={14} />
          </button>
        </Flex>
      </Flex>
    </MobileNavBar>
  );
};

export default MobileConfirmPayment;

const pendingInvoices = [
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
