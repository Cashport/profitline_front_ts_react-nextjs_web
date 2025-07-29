"use client";
import React from "react";
import { Flex } from "antd";
import { CurrencyDollarSimple } from "phosphor-react";
import BaseCard from "../../components/atoms/BaseCard/BaseCard";
import "./mobileConfirmPayment.scss";

const MobileConfirmPayment: React.FC = () => {
  return (
    <div className="mobileConfirmPayment">
      <h1>Detalle del pago</h1>
      <Flex vertical>
        {/* PaymentDetailCard */}

        <Flex vertical gap="1rem">
          <h4 className="myPaymentsTab__title">Facturas incluidas</h4>

          <Flex vertical gap="0.5rem">
            {pendingInvoices.map((payment) => (
              <BaseCard
                key={payment.id}
                icon={<CurrencyDollarSimple size={16} weight="light" />}
                iconBackgroundColor="#E5FFE0"
                iconColor="#334455"
                subtitle={payment.date}
                amount={payment.formattedAmount}
                isInteractive={false}
                className="creditBalanceCard"
              />
            ))}
          </Flex>
        </Flex>
      </Flex>
    </div>
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
