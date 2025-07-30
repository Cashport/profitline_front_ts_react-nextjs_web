"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { Basket } from "@phosphor-icons/react";

import BaseCard from "../../components/atoms/BaseCard/BaseCard";
import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PaymentSummaryCard from "../../components/PaymentSummaryCard/PaymentSummaryCard";

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
        <PaymentSummaryCard billed={32487323} discount={3219933} total={29267390} />

        <Flex vertical>
          <h4 className="pendingInvoiceDetail__title">Productos</h4>

          {mockProducts.map((product) => (
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
