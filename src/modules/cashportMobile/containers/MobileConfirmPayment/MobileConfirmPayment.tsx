"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { PencilSimpleLine } from "@phosphor-icons/react";

import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PendingInvoiceCard from "../../components/PendingInvoiceCard/PendingInvoiceCard";
import PaymentSummaryCard from "../../components/PaymentSummaryCard/PaymentSummaryCard";

import "./mobileConfirmPayment.scss";

const MobileConfirmPayment: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/mobile");
  };

  const handleModifyPayment = () => {
    router.push("/mobile/confirmPayment/modify");
  };

  return (
    <MobileNavBar title={"Detalles del pago"} onBack={handleGoBack}>
      <Flex vertical gap={"2rem"} className="mobileConfirmPayment">
        <PaymentSummaryCard billed={32487323} discount={3219933} total={29267390} />

        <Flex vertical gap="1rem">
          <h4 className="mobileConfirmPayment__title">Facturas incluidas</h4>

          <Flex vertical gap="0.5rem">
            {[].map((invoice: any) => (
              <PendingInvoiceCard
                key={invoice.id}
                invoice={{
                  id: invoice.id,
                  code: invoice.code,
                  date: invoice.date,
                  status: invoice.status,
                  isPastDue: invoice.isPastDue || false,
                  formattedAmount: invoice.formattedAmount,
                  formattedOriginalAmount: invoice.formattedOriginalAmount
                }}
                onClick={() => console.log(invoice.id)}
                isInteractive={false}
              />
            ))}
          </Flex>

          <button className="mobileConfirmPayment__modifyButton" onClick={handleModifyPayment}>
            Modificar pago
            <PencilSimpleLine size={14} />
          </button>
        </Flex>
      </Flex>
    </MobileNavBar>
  );
};

export default MobileConfirmPayment;
