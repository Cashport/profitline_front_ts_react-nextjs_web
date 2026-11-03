import React from "react";
import { Button, Flex } from "antd";
import { useAppStore } from "@/lib/store/store";
import { useTranslations } from "use-intl";

import "./paymentSummaryConfirm.scss";

interface paymentSummaryConfirmProps {
  total: number;
  onConfirm?: () => void;
}

const PaymentSummaryConfirm: React.FC<paymentSummaryConfirmProps> = ({ total, onConfirm }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const t = useTranslations("publicPortals.mobile.payment");
  const tCommon = useTranslations("common");

  return (
    <Flex vertical gap="1rem" className="paymentSummaryConfirm">
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryConfirm__label">{tCommon("fields.total")}</p>
        <p className="paymentSummaryConfirm__amount">
          <span className="paymentSummaryConfirm__currency">$</span>
          {formatMoney(total, {
            hideCurrencySymbol: true
          })}
        </p>
      </Flex>

      <Button
        type="primary"
        size="large"
        block
        className="paymentSummaryConfirm__pay-button"
        onClick={onConfirm}
      >
        {t("confirmPayment")}
      </Button>
    </Flex>
  );
};

export default PaymentSummaryConfirm;
