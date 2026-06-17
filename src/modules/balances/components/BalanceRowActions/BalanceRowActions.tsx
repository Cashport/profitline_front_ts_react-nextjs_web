import { Button, Dropdown, MenuProps } from "antd";
import { DotsThreeVertical } from "@phosphor-icons/react";

import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { BalanceDecisionAction } from "../ModalApproveRejectBalance/ModalApproveRejectBalance";

export type BalanceTableContext = "balances" | "clientBalances";

interface BalanceRowActionsProps {
  record: IBalanceRow;
  context?: BalanceTableContext;
  onCargarSoporte: (record: IBalanceRow) => void;
  onEnviarAprobacion: (record: IBalanceRow) => void;
  onDecision: (record: IBalanceRow, action: BalanceDecisionAction) => void;
}

export function BalanceRowActions({
  record,
  context = "balances",
  onCargarSoporte,
  onEnviarAprobacion,
  onDecision
}: BalanceRowActionsProps) {
  const statusCode = (record.status_code ?? "").toLowerCase();

  const buildItems = (): MenuProps["items"] => {
    if (context === "clientBalances") {
      switch (statusCode) {
        case "pending":
          return [
            {
              key: "cargar-soporte",
              label: "Cargar soporte",
              onClick: () => onCargarSoporte(record)
            }
          ];
        default:
          return [];
      }
    }

    switch (statusCode) {
      case "pending":
        return [
          {
            key: "enviar-otros-saldos",
            label: "Enviar a otros saldos",
            // eslint-disable-next-line no-console
            onClick: () => console.log("Enviar a otros saldos", { record })
          },
          {
            key: "cargar-soporte",
            label: "Cargar soporte",
            onClick: () => onCargarSoporte(record)
          }
        ];
      case "audit":
        return [
          {
            key: "rechazar-soportes",
            label: "Rechazar soportes",
            // eslint-disable-next-line no-console
            onClick: () => console.log("Rechazar soportes", { record })
          },
          {
            key: "enviar-aprobacion",
            label: "Enviar a aprobación",
            onClick: () => onEnviarAprobacion(record)
          }
        ];
      case "approvals":
        return [
          {
            key: "aprobar",
            label: "Aprobar",
            onClick: () => onDecision(record, "approve")
          },
          {
            key: "rechazar",
            label: "Rechazar",
            onClick: () => onDecision(record, "reject")
          }
        ];
      default:
        return [];
    }
  };

  const items = buildItems();
  const hasActions = !!items && items.length > 0;

  return (
    <Dropdown menu={{ items }} trigger={["click"]} disabled={!hasActions}>
      <Button
        className="buttonSeeProject"
        disabled={!hasActions}
        icon={<DotsThreeVertical size={"1.3rem"} weight="bold" />}
      />
    </Dropdown>
  );
}
