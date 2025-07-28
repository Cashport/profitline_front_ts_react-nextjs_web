import React from "react";
import { Flex } from "antd";
import { CalendarSlash, CaretRight, Invoice } from "@phosphor-icons/react";
import "./pendingInvoiceCard.scss";

export interface PendingInvoiceCardProps {
  invoice: {
    id: string | number;
    code: string;
    date: string;
    isPastDue: boolean;
    formattedAmount: string;
    formattedOriginalAmount?: string;
  };
}

const PendingInvoiceCard: React.FC<PendingInvoiceCardProps> = ({ invoice }) => (
  <Flex justify="space-between" align="center" className="pendingInvoiceCard__invoice-item">
    <Flex gap={"0.5rem"} align="center">
      <Invoice className="pendingInvoiceCard__invoice-icon" size={16} weight="light" />

      <Flex vertical>
        <p className="pendingInvoiceCard__invoice-code">{invoice.code}</p>
        <p className="pendingInvoiceCard__invoice-date">{invoice.date}</p>
        {invoice.isPastDue && (
          <Flex gap={"0.25rem"} align="center">
            <CalendarSlash color="#ff0010" size={12} weight="light" />
            <p className="pendingInvoiceCard__invoice-text-overdue">Factura vencida</p>
          </Flex>
        )}
      </Flex>
    </Flex>

    <Flex align="center" gap={"1rem"}>
      <Flex vertical align="end">
        <p
          className={`pendingInvoiceCard__invoice-amount ${
            invoice.isPastDue ? "pendingInvoiceCard__invoice-amount--overdue" : ""
          }`}
        >
          <span className="pendingInvoiceCard__currency">$</span> {invoice.formattedAmount}
        </p>
        {invoice.formattedOriginalAmount && (
          <p className="pendingInvoiceCard__invoice-original-amount">
            <span className="pendingInvoiceCard__currency">$</span>{" "}
            {invoice.formattedOriginalAmount}
          </p>
        )}
      </Flex>

      <CaretRight className="pendingInvoiceCard__caret-icon" size={16} />
    </Flex>
  </Flex>
);

export default PendingInvoiceCard;
