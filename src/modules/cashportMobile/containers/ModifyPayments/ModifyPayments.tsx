"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { PlusCircle } from "@phosphor-icons/react";

import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PendingInvoiceCard from "../../components/PendingInvoiceCard/PendingInvoiceCard";

import "./modifyPayments.scss";

const ModifyPayments: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/confirmPayment");
  };

  return (
    <MobileNavBar title={"Modificar y pagar"} onBack={handleGoBack}>
      <Flex vertical gap={"0.625rem"} className="modifyPayments">
        <Flex vertical gap="1rem">
          <p className="modifyPayments__description">
            Ingresa los valores que deseas pagar por cada factura
          </p>

          <Flex vertical gap="0.5rem">
            {pendingInvoices.map((invoice) => (
              <PendingInvoiceCard
                key={invoice.id}
                invoice={{
                  id: invoice.id,
                  code: invoice.code,
                  date: invoice.date,
                  isPastDue: invoice.isPastDue || false,
                  formattedOriginalAmount: invoice.formattedOriginalAmount
                }}
                onClick={() => console.log(invoice.id)}
                isInteractive={false}
                rightColumnNode={<p className="modifyPayments__amount">ACA VA EL INPUT</p>}
              />
            ))}
          </Flex>
        </Flex>

        <button className="modifyPayments__addDocument">
          Agregar documento
          <PlusCircle size={14} />
        </button>
      </Flex>
    </MobileNavBar>
  );
};

export default ModifyPayments;

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
