import React from "react";
import { Button, Flex } from "antd";
import { useAppStore } from "@/lib/store/store";

import "./paymentSummaryConfirm.scss";

interface paymentSummaryConfirmProps {
  total: number;
  onConfirm?: () => void;
}

const PaymentSummaryConfirm: React.FC<paymentSummaryConfirmProps> = ({ total, onConfirm }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <Flex vertical gap="1rem" className="paymentSummaryConfirm">
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryConfirm__label">Total</p>
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
        Confirmar pago
      </Button>
    </Flex>
  );
};

export default PaymentSummaryConfirm;
