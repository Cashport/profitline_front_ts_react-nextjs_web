import React from "react";
import { Button, Flex, message } from "antd";
import { useAppStore } from "@/lib/store/store";

import "./paymentSummaryCard.scss";

interface PaymentSummaryCardProps {
  billed: number;
  discount: number;
  total: number;
  paymentLink?: string | null;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  billed,
  discount,
  total,
  paymentLink
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const isValidPaymentLink =
    typeof paymentLink === "string" &&
    paymentLink.trim().length > 0 &&
    paymentLink.startsWith("http");

  const handleConfirmPayment = () => {
    if (!isValidPaymentLink) {
      message.error("El link de pago no es válido o ya expiró.");
      return;
    }

    window.location.href = paymentLink!;
  };

  return (
    <Flex vertical gap="1rem" className="paymentSummaryCard">
      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Facturado</p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">$</span>
          {formatMoney(billed, { hideCurrencySymbol: true })}
        </p>
      </Flex>

      <Flex align="center" justify="space-between">
        <p className="paymentSummaryCard__label">Descuento pronto pago</p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">-$</span>
          {formatMoney(discount, { hideCurrencySymbol: true })}
        </p>
      </Flex>

      <hr className="paymentSummaryCard__divider" />

      <Flex align="center" justify="space-between" style={{ fontWeight: "bold" }}>
        <p className="paymentSummaryCard__label">Total</p>
        <p className="paymentSummaryCard__amount">
          <span className="paymentSummaryCard__currency">$</span>
          {formatMoney(total, { hideCurrencySymbol: true })}
        </p>
      </Flex>

      <Button
        type="primary"
        size="large"
        block
        className="paymentSummaryCard__pay-button"
        onClick={handleConfirmPayment}
        disabled={!isValidPaymentLink}
      >
        Confirmar pago
      </Button>
    </Flex>
  );
};

export default PaymentSummaryCard;
