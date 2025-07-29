"use client";
import React from "react";
import { Flex } from "antd";
import { PlusCircle } from "@phosphor-icons/react";

import PendingInvoiceCard from "@/modules/cashportMobile/components/PendingInvoiceCard/PendingInvoiceCard";
import CreditBalanceCard from "@/modules/cashportMobile/components/CreditBalanceCard/CreditBalanceCard";

import "./pendingInvoicesTab.scss";

interface Invoice {
  id: string | number;
  code: string;
  date: string;
  isPastDue?: boolean;
  formattedAmount: string;
  formattedOriginalAmount?: string;
}

interface CreditBalance {
  id: string | number;
  description: string;
  date: string;
  formattedAmount: string;
}

export interface PendingInvoicesTabProps {
  pendingInvoices: Invoice[];
  creditBalances: CreditBalance[];
}

const PendingInvoicesTab: React.FC<PendingInvoicesTabProps> = ({
  pendingInvoices,
  creditBalances
}) => {
  const handleClickInvoice = (invoiceId: string | number) => {
    console.log(`Clicked on invoice ${invoiceId}`);
  };
  return (
    <Flex className="pendingInvoicesTab" vertical gap="2rem">
      <Flex vertical gap="0.5rem">
        {pendingInvoices.map((invoice: Invoice) => (
          <PendingInvoiceCard
            key={invoice.id}
            invoice={{
              id: invoice.id,
              code: invoice.code,
              date: invoice.date,
              isPastDue: invoice.isPastDue || false,
              formattedAmount: invoice.formattedAmount,
              formattedOriginalAmount: invoice.formattedOriginalAmount
            }}
            onClick={() => handleClickInvoice(invoice.id)}
          />
        ))}
      </Flex>

      {creditBalances.length > 0 && (
        <Flex vertical gap="1rem">
          <h4 className="pendingInvoicesTab__title">Saldo a favor</h4>

          <Flex vertical gap="0.5rem">
            {creditBalances.map((credit) => (
              <CreditBalanceCard key={credit.id} credit={credit} />
            ))}
          </Flex>

          <button className="pendingInvoicesTab__reportButton">
            Reportar novedad
            <PlusCircle size={14} />
          </button>
        </Flex>
      )}
    </Flex>
  );
};

export default PendingInvoicesTab;
