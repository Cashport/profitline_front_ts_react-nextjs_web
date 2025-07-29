import React from "react";
import { Button, Flex } from "antd";
import { useAppStore } from "@/lib/store/store";

import "./paymentSummaryCard.scss";

interface PaymentSummaryCardProps {
  billed: number;
  discount: number;
  total: number;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({ billed, discount, total }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <Flex vertical gap="1rem" className="paymentSummaryCard">
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Facturado </p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">$</span>
          {formatMoney(billed, {
            hideCurrencySymbol: true
          })}
        </p>
      </Flex>
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Descuento pronto pago</p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">-$</span>
          {formatMoney(discount, {
            hideCurrencySymbol: true
          })}
        </p>
      </Flex>
      <hr className="paymentSummaryCard__divider" />
      <Flex align="center" justify="space-between" style={{ fontWeight: "bold" }}>
        <p className="paymentSummaryCard__label">Total</p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">$</span>
          {formatMoney(total, {
            hideCurrencySymbol: true
          })}
        </p>
      </Flex>

      <Button
        type="primary"
        size="large"
        block
        className="paymentSummaryCard__pay-button"
        onClick={() => console.log("Ir a pagar")}
      >
        Confirmar pago
      </Button>
    </Flex>
  );
};

export default PaymentSummaryCard;
