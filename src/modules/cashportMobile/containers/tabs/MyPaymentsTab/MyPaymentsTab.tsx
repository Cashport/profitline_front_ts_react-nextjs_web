"use client";
import React, { useState } from "react";
import { Flex } from "antd";
import { CurrencyDollarSimple, PlusCircle, CaretDown, CaretUp } from "@phosphor-icons/react";
import BaseCard from "@/modules/cashportMobile/components/atoms/BaseCard/BaseCard";

import "./myPaymentsTab.scss";
import { CreditBalancePayments } from "@/types/clients/IClients";
import { formatCurrencyMoney } from "@/utils/utils";
import { formatDate } from "../../CashportMobileView/CashportMobileView";

export interface MyPaymentsTabProps {
  availablePayments: CreditBalancePayments[];
}

const MyPaymentsTab: React.FC<MyPaymentsTabProps> = ({ availablePayments }) => {
  const [showAllAvailable, setShowAllAvailable] = useState(false);
  const INITIAL_COUNT = 5;

  const visibleAvailable = showAllAvailable
    ? availablePayments
    : availablePayments.slice(0, INITIAL_COUNT);
  const hasMoreAvailable = availablePayments.length > INITIAL_COUNT;

  const getExtraInfo = (payment: CreditBalancePayments) => {
    return (
      <Flex gap={"0.5rem"} align="center">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: payment.color
          }}
        />
        <span style={{ color: payment.color, fontSize: "12px", fontWeight: 500 }}>
          {payment.status_description}
        </span>
      </Flex>
    );
  };

  return (
    <Flex className="myPaymentsTab" vertical gap="2rem">
      {availablePayments.length > 0 && (
        <Flex vertical gap="1rem">
          <h4 className="myPaymentsTab__title">Pagos disponibles</h4>

          <Flex vertical gap="0.5rem">
            {visibleAvailable.map((payment) => (
              <BaseCard
                key={payment.id}
                icon={<CurrencyDollarSimple size={16} weight="light" />}
                iconBackgroundColor="#E5FFE0"
                iconColor="#334455"
                title={payment.description}
                subtitle={formatDate(payment.payment_date)}
                amount={formatCurrencyMoney(payment.current_value)}
                isInteractive={false}
                className="creditBalanceCard"
                extra={getExtraInfo(payment)}
              />
            ))}
          </Flex>

          {hasMoreAvailable && (
            <button
              className="myPaymentsTab__seeMoreButton"
              onClick={() => setShowAllAvailable(!showAllAvailable)}
            >
              {showAllAvailable ? "Ver menos" : "Ver más"}
              {showAllAvailable ? <CaretUp size={14} /> : <CaretDown size={14} />}
            </button>
          )}

          <button className="myPaymentsTab__reportButton" disabled>
            Reportar pago
            <PlusCircle size={14} />
          </button>
        </Flex>
      )}
    </Flex>
  );
};

export default MyPaymentsTab;
