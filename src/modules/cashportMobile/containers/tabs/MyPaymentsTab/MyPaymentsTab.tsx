"use client";
import React from "react";
import { Flex } from "antd";
import { CurrencyDollarSimple, PlusCircle } from "@phosphor-icons/react";
import BaseCard from "@/modules/cashportMobile/components/atoms/BaseCard/BaseCard";

import "./myPaymentsTab.scss";

interface IAvailablePayments {
  id: string | number;
  date: string;
  formattedAmount: string;
}

export interface MyPaymentsTabProps {
  availablePayments: IAvailablePayments[];
}

const MyPaymentsTab: React.FC<MyPaymentsTabProps> = ({ availablePayments }) => {
  return (
    <Flex className="myPaymentsTab" vertical gap="2rem">
      {availablePayments.length > 0 && (
        <Flex vertical gap="1rem">
          <h4 className="myPaymentsTab__title">Pagos disponibles</h4>

          <Flex vertical gap="0.5rem">
            {availablePayments.map((payment) => (
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

          <button className="myPaymentsTab__reportButton">
            Reportar pago
            <PlusCircle size={14} />
          </button>
        </Flex>
      )}

      {availablePayments.length > 0 && (
        <Flex vertical gap="1rem">
          <h4 className="myPaymentsTab__title">Últimos pagos</h4>

          <Flex vertical gap="0.5rem">
            {availablePayments.map((payment) => (
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
      )}
    </Flex>
  );
};

export default MyPaymentsTab;
