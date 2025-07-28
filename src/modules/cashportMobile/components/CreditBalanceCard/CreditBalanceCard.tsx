"use client";
import React from "react";
import { ArrowUUpLeft } from "@phosphor-icons/react";
import BaseCard from "../atoms/BaseCard/BaseCard";

export interface CreditBalanceCardProps {
  credit: {
    id: string | number;
    description: string;
    date: string;
    formattedAmount: string;
  };
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({ credit }) => {
  return (
    <BaseCard
      icon={<ArrowUUpLeft size={16} weight="light" />}
      iconBackgroundColor="#e8e2ff"
      iconColor="#6b47dc"
      title={credit.description}
      subtitle={credit.date}
      amount={credit.formattedAmount}
      isInteractive={false}
      className="creditBalanceCard"
    />
  );
};

export default CreditBalanceCard;
