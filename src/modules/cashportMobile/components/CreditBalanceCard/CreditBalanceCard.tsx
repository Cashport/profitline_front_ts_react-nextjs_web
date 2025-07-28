"use client";
import React from "react";
import { Flex } from "antd";
import { ArrowUUpLeft } from "@phosphor-icons/react";
import "./creditBalanceCard.scss";

export interface CreditBalanceCardProps {
  credit: {
    id: string | number;
    description: string;
    date: string;
    formattedAmount: string;
  };
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({ credit }) => (
  <Flex justify="space-between" align="center" className="creditBalanceCard__credit-item">
    <Flex gap={"0.5rem"} align="center">
      <ArrowUUpLeft className="creditBalanceCard__credit-icon" size={16} weight="light" />

      <Flex vertical>
        <p className="creditBalanceCard__credit-description">{credit.description}</p>
        <p className="creditBalanceCard__credit-date">{credit.date}</p>
      </Flex>
    </Flex>

    <Flex vertical align="end">
      <p className="creditBalanceCard__credit-amount">
        <span className="creditBalanceCard__currency">$</span> {credit.formattedAmount}
      </p>
    </Flex>
  </Flex>
);

export default CreditBalanceCard;
