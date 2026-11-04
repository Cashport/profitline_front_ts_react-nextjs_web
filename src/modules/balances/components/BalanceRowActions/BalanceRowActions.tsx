import { Button, Dropdown, MenuProps } from "antd";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { BalanceDecisionAction } from "../ModalApproveRejectBalance/ModalApproveRejectBalance";

export type BalanceTableContext = "balances" | "clientBalances";

interface BalanceRowActionsProps {
  record: IBalanceRow;
  context?: BalanceTableContext;
  onCargarSoporte: (record: IBalanceRow) => void;
  onEnviarAprobacion: (record: IBalanceRow) => void;
  onSendOtherBalances: (record: IBalanceRow) => void;
  onDecision: (record: IBalanceRow, action: BalanceDecisionAction) => void;
}

export function BalanceRowActions({
  record,
  context = "balances",
  onCargarSoporte,
  onEnviarAprobacion,
  onSendOtherBalances,
  onDecision
}: BalanceRowActionsProps) {
  const t = useTranslations("balances.rowActions");
  const statusCode = (record.status_code ?? "").toLowerCase();

  const buildItems = (): MenuProps["items"] => {
    switch (statusCode) {
      case "pending":
        return [
          {
            key: "enviar-otros-saldos",
            label: t("sendToOther"),
            onClick: () => onSendOtherBalances(record)
          },
          {
            key: "cargar-soporte",
            label: t("uploadSupport"),
            onClick: () => onCargarSoporte(record)
          }
        ];
      case "audit":
        return [
          {
            key: "rechazar-soportes",
            label: t("rejectSupports"),
            // eslint-disable-next-line no-console
            onClick: () => console.log("Rechazar soportes", { record })
          },
          {
            key: "enviar-aprobacion",
            label: t("sendToApproval"),
            onClick: () => onEnviarAprobacion(record)
          }
        ];
      case "approvals":
        return [
          {
            key: "aprobar",
            label: t("approve"),
            onClick: () => onDecision(record, "approve")
          },
          {
            key: "rechazar",
            label: t("reject"),
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
