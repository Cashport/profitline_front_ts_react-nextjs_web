import React from "react";
import { Typography, Button, Flex } from "antd";
import Image from "next/image";

import "./totalDebtCard.scss";

const { Text, Title } = Typography;

interface TotalDebtProps {
  totalDebt: number | string;
  readyToPay: number | string;
  onPay?: () => void;
}

const TotalDebtCard: React.FC<TotalDebtProps> = ({ totalDebt, readyToPay, onPay }) => (
  <div className="TotalDebtCard">
    <Flex align="center" justify="space-between">
      <div className="TotalDebtCard__total-section">
        <Text className="TotalDebtCard__label">Deuda total</Text>
        <div className="TotalDebtCard__total-row">
          <Title level={3} className="TotalDebtCard__total-amount">
            <span className="TotalDebtCard__currency">$</span> {totalDebt}
          </Title>
        </div>
      </div>

      <Image
        src="https://picsum.photos/60/60"
        alt="Brand"
        width={60}
        height={60}
        className="TotalDebtCard__brand-logo"
      />
    </Flex>

    <span className="TotalDebtCard__divider" />

    <Flex align="center" justify="space-between">
      <Text className="TotalDebtCard__label-400">
        Pronto pago <span className="TotalDebtCard__label-note">(Faltan 2 días)</span>
      </Text>

      <Title level={5} className="TotalDebtCard__ready-amount">
        <span className="TotalDebtCard__currency">$</span>
        {readyToPay}
      </Title>
    </Flex>

    <Button type="primary" size="large" block className="TotalDebtCard__pay-button" onClick={onPay}>
      Ir a pagar
    </Button>
  </div>
);

export default TotalDebtCard;
