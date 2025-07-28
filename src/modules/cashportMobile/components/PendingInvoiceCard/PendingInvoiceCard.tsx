"use client";

import React from "react";
import { Flex } from "antd";
import { CalendarSlash, Invoice } from "@phosphor-icons/react";
import "./pendingInvoiceCard.scss";
import BaseCard from "../atoms/BaseCard/BaseCard";

export interface PendingInvoiceCardProps {
  invoice: {
    id: string | number;
    code: string;
    date: string;
    isPastDue: boolean;
    formattedAmount: string;
    formattedOriginalAmount?: string;
  };
  onClick?: () => void;
}

const PendingInvoiceCard: React.FC<PendingInvoiceCardProps> = ({ invoice, onClick }) => {
  const extra = invoice.isPastDue ? (
    <Flex gap={"0.25rem"} align="center">
      <CalendarSlash color="#ff0010" size={12} weight="light" />
      <span className="pendingInvoiceCard__text-overdue">Factura vencida</span>
    </Flex>
  ) : null;

  return (
    <BaseCard
      icon={<Invoice size={16} weight="light" />}
      iconBackgroundColor="#d6faff"
      iconColor="#0066CC"
      title={invoice.code}
      subtitle={invoice.date}
      extra={extra}
      amount={invoice.formattedAmount}
      originalAmount={invoice.formattedOriginalAmount}
      amountColor={invoice.isPastDue ? "#ff0010" : undefined}
      isInteractive={true}
      onClick={onClick}
      className="pendingInvoiceCard"
    />
  );
};

export default PendingInvoiceCard;
