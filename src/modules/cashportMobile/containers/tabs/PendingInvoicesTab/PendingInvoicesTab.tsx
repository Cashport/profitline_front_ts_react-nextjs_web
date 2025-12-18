"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

import PendingInvoiceCard from "@/modules/cashportMobile/components/PendingInvoiceCard/PendingInvoiceCard";

import "./pendingInvoicesTab.scss";
import { InvoiceFormated } from "@/types/clients/IClients";

export interface PendingInvoicesTabProps {
  pendingInvoices: InvoiceFormated[];
}
const PendingInvoicesTab: React.FC<PendingInvoicesTabProps> = ({
  pendingInvoices
}) => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 5;

  const visibleInvoices = showAll ? pendingInvoices : pendingInvoices.slice(0, INITIAL_COUNT);
  const hasMore = pendingInvoices.length > INITIAL_COUNT;

  const handleClickInvoice = (invoiceId: string | number) => {
    router.push(`/mobile/invoice/${invoiceId}`);
  };

  return (
    <Flex className="pendingInvoicesTab" vertical gap="2rem">
      <Flex vertical gap="0.5rem">
        {visibleInvoices.map((invoice: InvoiceFormated) => (
          <PendingInvoiceCard
            key={invoice.id}
            invoice={{
              id: invoice.id,
              code: invoice.code,
              date: invoice.date,
              status: invoice.status as any,
              isPastDue: invoice.isPastDue || false,
              formattedAmount: invoice.formattedAmount,
              formattedOriginalAmount: invoice.formattedOriginalAmount
            }}
            onClick={() => handleClickInvoice(invoice.id)}
          />
        ))}
      </Flex>

      {hasMore && (
        <button
          className="pendingInvoicesTab__seeMoreButton"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Ver menos" : "Ver más"}
          {showAll ? <CaretUp size={14} /> : <CaretDown size={14} />}
        </button>
      )}
    </Flex>
  );
};

export default PendingInvoicesTab;
