import React from "react";
import { useTranslations } from "use-intl";

import { Tag } from "@/components/atoms/Tag/Tag";
import { BotHealthStatus, BotRawStatus } from "@/types/bots/IBotHealth";
import { getBotStatusDetails } from "../botStatusMap";

interface BotStatusBadgeProps {
  estado: BotRawStatus | BotHealthStatus | string | null | undefined;
}

// Reutiliza el componente Tag existente (src/components/atoms/Tag/Tag.tsx) y el mismo
// patrón visual de badge de estado usado en ThirdPartiesView (color + backgroundColor + icono).
export const BotStatusBadge: React.FC<BotStatusBadgeProps> = ({ estado }) => {
  const t = useTranslations("botHealth.status");
  const { labelKey, color, backgroundColor, icon } = getBotStatusDetails(estado);
  const text = t(labelKey);

  return (
    <Tag
      icon={icon}
      content={text}
      style={{
        border: "none",
        whiteSpace: "nowrap",
        backgroundColor,
        color,
        fontSize: 14,
        fontWeight: 400,
        padding: "4px 12px"
      }}
    />
  );
};
