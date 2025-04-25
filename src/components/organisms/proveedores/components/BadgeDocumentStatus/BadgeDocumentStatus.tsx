import React from "react";
import { getStatusDetails } from "../../utils/documentStatusMap";

import "./badgeDocumentStatus.scss";

interface BadgeDocumentStatusProps {
  statusId: string;
}

const BadgeDocumentStatus: React.FC<BadgeDocumentStatusProps> = ({ statusId }) => {
  const { text, color, icon, backgroundColor } = getStatusDetails(statusId);

  return (
    <>
      <div
        style={{ "--color": color, "--bg-color": backgroundColor } as React.CSSProperties}
        className="badge-document-status"
      >
        {icon} {text}
      </div>
    </>
  );
};

export default BadgeDocumentStatus;
