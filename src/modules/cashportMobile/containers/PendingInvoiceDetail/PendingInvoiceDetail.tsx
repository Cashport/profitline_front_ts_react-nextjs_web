"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { Basket } from "@phosphor-icons/react";

import BaseCard from "../../components/atoms/BaseCard/BaseCard";
import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import InvoiceSummaryCard from "../../components/InvoiceSummaryCard/InvoiceSummaryCard";

import "./pendingInvoiceDetail.scss";

const PendingInvoiceDetail: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    console.log("Going back");
    router.push("/mobile");
  };

  return (
    <MobileNavBar title={"Detalle"} onBack={handleGoBack}>
      <Flex vertical gap={"2rem"} className="pendingInvoiceDetail">
        <InvoiceSummaryCard />

        <Flex vertical>
          <h4 className="pendingInvoiceDetail__title">Productos</h4>

          {mockProducts.map((product, index) => (
            <>
              <BaseCard
                key={product.id}
                icon={<Basket size={16} weight="light" />}
                iconBackgroundColor="#EEF1F1"
                iconColor="#334455"
                title={product.code}
                subtitle={`${product.quantity} uds.`}
                amount={product.formattedAmount}
                className="productCard"
              />
              {index !== mockProducts.length - 1 && (
                <hr className="pendingInvoiceDetail__divider" />
              )}
            </>
          ))}
        </Flex>
      </Flex>
    </MobileNavBar>
  );
};

export default PendingInvoiceDetail;

const mockProducts = [
  {
    id: "1",
    code: "Nombre del producto 1",
    amount: 288000,
    formattedAmount: "50.000",
    quantity: 10
  },
  {
    id: "2",
    code: "Nombre del producto 2",
    formattedAmount: "50.000",
    quantity: 10
  },
  {
    id: "3",
    code: "Nombre del producto 3",
    formattedAmount: "50.000",
    quantity: 10
  }
];
