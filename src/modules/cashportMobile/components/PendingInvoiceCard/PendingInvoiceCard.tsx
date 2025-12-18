"use client";

import React from "react";
import { Flex } from "antd";
import { Invoice } from "@phosphor-icons/react";
import "./pendingInvoiceCard.scss";
import BaseCard from "../atoms/BaseCard/BaseCard";

export type InvoiceStatus = "Overdue" | "Due soon" | "Current";

export interface PendingInvoiceCardProps {
  invoice: {
    id: string | number;
    code: string;
    date: string;
    isPastDue: boolean;
    status: InvoiceStatus;
    formattedAmount?: string;
    formattedOriginalAmount?: string;
  };
  onClick?: () => void;
  isInteractive?: boolean;
  rightColumnNode?: React.ReactNode;
}

const PendingInvoiceCard: React.FC<PendingInvoiceCardProps> = ({
  invoice,
  onClick,
  rightColumnNode,
  isInteractive = true
}) => {
  const getStatusConfig = () => {
    if (invoice.isPastDue || invoice.status === "Overdue") {
      return { color: "#ff6b6b", text: "Vencidas" };
    }
    if (invoice.status === "Due soon") {
      return { color: "#ff9f43", text: "Vence pronto" };
    }
    if (invoice.status === "Current") {
      return { color: "#feca57", text: "Vigente" };
    }
    return null;
  };

  const statusConfig = getStatusConfig();

  const extra = statusConfig ? (
    <Flex gap={"0.5rem"} align="center">
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: statusConfig.color
        }}
      />
      <span style={{ color: statusConfig.color, fontSize: "12px", fontWeight: 500 }}>
        {statusConfig.text}
      </span>
    </Flex>
  ) : null;

  return (
    <BaseCard
      icon={<Invoice size={16} weight="light" />}
      iconBackgroundColor="#d6faff"
      iconColor="#334455"
      title={invoice.code}
      subtitle={invoice.date}
      extra={extra}
      amount={invoice.formattedAmount}
      originalAmount={invoice.formattedOriginalAmount}
      amountColor={statusConfig ? statusConfig.color : undefined}
      isInteractive={isInteractive}
      onClick={onClick}
      className="pendingInvoiceCard"
      rightColumnNode={rightColumnNode}
    />
  );
};

export default PendingInvoiceCard;
