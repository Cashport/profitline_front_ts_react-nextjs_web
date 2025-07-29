import React from "react";
import { Button, Flex } from "antd";

import "./paymentSummaryCard.scss";

interface PaymentSummaryCardProps {
  billed: number;
  discount: number;
  total: number;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({ billed, discount, total }) => {
  return (
    <Flex vertical gap="1rem" className="paymentSummaryCard">
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Facturado </p>
        <p>{billed.toFixed(2)}</p>
      </Flex>
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Descuento pronto pago</p>
        <p>-{discount.toFixed(2)}</p>
      </Flex>
      <hr className="paymentSummaryCard__divider" />
      <Flex align="center" justify="space-between" style={{ fontWeight: "bold" }}>
        <p className="paymentSummaryCard__label">Total</p>
        <p>{total.toFixed(2)}</p>
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
