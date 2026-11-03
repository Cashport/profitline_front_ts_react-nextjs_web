import React from "react";
import { useTranslations } from "use-intl";
import { getStatusDetails } from "../../utils/documentStatusMap";

import "./badgeDocumentStatus.scss";

interface BadgeDocumentStatusProps {
  statusId: string;
}

const BadgeDocumentStatus: React.FC<BadgeDocumentStatusProps> = ({ statusId }) => {
  const t = useTranslations("suppliers.documentStatus");
  const { labelKey, text, color, icon, backgroundColor, textWrapper } = getStatusDetails(statusId);
  const label = labelKey ? t(labelKey) : text ?? t("unknown");

  return (
    <>
      <div
        style={{ "--color": color, "--bg-color": backgroundColor } as React.CSSProperties}
        className="badge-document-status"
      >
        {icon} {textWrapper ? textWrapper(label) : label}
      </div>
    </>
  );
};

export default BadgeDocumentStatus;
