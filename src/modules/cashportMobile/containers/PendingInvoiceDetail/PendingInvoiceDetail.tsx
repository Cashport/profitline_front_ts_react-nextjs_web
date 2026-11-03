"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { Basket } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import BaseCard from "../../components/atoms/BaseCard/BaseCard";
import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import InvoiceSummaryCard from "../../components/InvoiceSummaryCard/InvoiceSummaryCard";

import "./pendingInvoiceDetail.scss";

const PendingInvoiceDetail: React.FC = () => {
  const router = useRouter();
  const t = useTranslations("publicPortals.mobile.invoiceDetail");
  const tCommon = useTranslations("common");

  const handleGoBack = () => {
    console.log("Going back");
    router.push("/mobile");
  };

  return (
    <MobileNavBar title={tCommon("fields.detail")} onBack={handleGoBack}>
      <Flex vertical gap={"2rem"} className="pendingInvoiceDetail">
        <InvoiceSummaryCard />

        <Flex vertical>
          <h4 className="pendingInvoiceDetail__title">{t("products")}</h4>

          {mockProducts.map((product, index) => (
            <>
              <BaseCard
                key={product.id}
                icon={<Basket size={16} weight="light" />}
                iconBackgroundColor="#EEF1F1"
                iconColor="#334455"
                title={t("mockProductName", { number: product.id })}
                subtitle={t("units", { count: product.quantity })}
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
    amount: 288000,
    formattedAmount: "50.000",
    quantity: 10
  },
  {
    id: "2",
    formattedAmount: "50.000",
    quantity: 10
  },
  {
    id: "3",
    formattedAmount: "50.000",
    quantity: 10
  }
];
