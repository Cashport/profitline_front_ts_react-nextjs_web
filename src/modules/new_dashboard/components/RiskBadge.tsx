import React from "react";
import { useTranslations } from "use-intl";
import { COLORS, RISK_KEYS } from "../lib/constants";
import type { CustomerRisk } from "../lib/types";

interface RiskBadgeProps {
  level: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const t = useTranslations("newDashboard.risk");
  const riskKey = RISK_KEYS[level as CustomerRisk["risk"]];
  let bgColor = COLORS.riskMedium;

  switch (level) {
    case "Alto":
      bgColor = COLORS.riskHigh;
      break;
    case "Medio alto":
      bgColor = COLORS.riskMediumHigh;
      break;
    case "Medio":
      bgColor = COLORS.riskMedium;
      break;
    case "Medio bajo":
      bgColor = COLORS.riskMediumLow;
      break;
    case "Bajo":
      bgColor = COLORS.riskLow;
      break;
  }

  return (
    <span
      className="px-3 py-1 text-[13px] font-semibold text-white rounded-md w-full block text-center shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      {riskKey ? t(riskKey) : level}
    </span>
  );
};

export default RiskBadge;
