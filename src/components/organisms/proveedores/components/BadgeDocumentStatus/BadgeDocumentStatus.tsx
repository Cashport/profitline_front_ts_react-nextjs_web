import React from "react";
import { CheckCircle, Clock, MagnifyingGlass, Sparkle, XCircle } from "phosphor-react";

import "./badgeDocumentStatus.scss";

interface BadgeDocumentStatusProps {
  statusId: string;
}

const BadgeDocumentStatus: React.FC<BadgeDocumentStatusProps> = ({ statusId }) => {
  const getStatusDetails = (id: string) => {
    switch (id) {
      case "1":
        return {
          text: "No clasificado",
          color: "#92400e",
          icon: <Clock size={16} />,
          backgroundColor: "#fef2ca"
        };
      case "2":
        return {
          text: "En revisión",
          color: "#2143b0",
          icon: <MagnifyingGlass size={16} />,
          backgroundColor: "#e2ecfe"
        };
      case "3":
        return {
          text: "Vigente",
          color: "#065f46",
          icon: <CheckCircle size={16} />,
          backgroundColor: "#d9f4e8"
        };
      case "4":
        return {
          text: "Rechazado",
          color: "#e7092b",
          icon: <XCircle size={16} />,
          backgroundColor: "#fce6e9"
        };
      case "5":
        return {
          text: "Aprobado IA",
          color: "#6f25b6",
          icon: <Sparkle size={16} />,
          backgroundColor: "#f0eafb"
        };
      default:
        return {
          text: "Rechazado IA",
          color: "#1e5d90",
          icon: <Sparkle size={16} />,
          backgroundColor: "#dfe5ea"
        };
    }
  };

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
