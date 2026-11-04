import React from "react";
import { Button, Flex } from "antd";
import { useAppStore } from "@/lib/store/store";
import { useTranslations } from "use-intl";

import "./invoiceSummaryCard.scss";
import { Invoice } from "@phosphor-icons/react";

interface invoiceSummaryCardProps {}

const InvoiceSummaryCard: React.FC<invoiceSummaryCardProps> = ({}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const t = useTranslations("publicPortals.mobile.invoiceSummary");

  return (
    <Flex vertical gap="1rem" className="invoiceSummaryCard">
      <Flex align="center" justify="flex-start" gap="1rem">
        <Invoice className="invoiceSummaryCard__icon" size={24} weight="light" />

        <Flex vertical justify="flex-start" gap="0.5rem">
          <p className="invoiceSummaryCard__label">
            {t.rich("invoice", { code: "VT-22214", strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p className="invoiceSummaryCard__amount">
            <span className="invoiceSummaryCard__currency">$</span>
            {formatMoney(288000, {
              hideCurrencySymbol: true
            })}
          </p>
        </Flex>
      </Flex>
      <hr className="invoiceSummaryCard__divider" />
      <Flex align="center" justify="space-between">
        <p className="invoiceSummaryCard__label --400">
          {t("earlyPayment")}{" "}
          <span className="invoiceSummaryCard__label-note">{t("daysLeft", { count: 2 })}</span>
        </p>

        <p className="invoiceSummaryCard__ready-amount">
          <span className="invoiceSummaryCard__currency">$</span>
          {formatMoney(259200, {
            hideCurrencySymbol: true
          })}
        </p>
      </Flex>

      <Flex align="center" gap={"1rem"}>
        <Button
          type="primary"
          size="large"
          block
          className="invoiceSummaryCard__credit-button"
          onClick={() => console.log("Ir a pagar")}
        >
          {t("payPartially")}
        </Button>

        <Button
          type="primary"
          size="large"
          block
          className="invoiceSummaryCard__pay-button"
          onClick={() => console.log("Ir a pagar")}
        >
          {t("goToPay")}
        </Button>
      </Flex>
    </Flex>
  );
};

export default InvoiceSummaryCard;
