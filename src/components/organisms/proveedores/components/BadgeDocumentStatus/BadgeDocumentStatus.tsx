import React from "react";
import { CheckCircle, Clock, MagnifyingGlass, Sparkle, XCircle } from "phosphor-react";

import "./badgeDocumentStatus.scss";

interface BadgeDocumentStatusProps {
  statusId: string;
}

const BadgeDocumentStatus: React.FC<BadgeDocumentStatusProps> = ({ statusId }) => {
  const getStatusDetails = (id: string) => {
    switch (id) {
      case "a88b6d87-42f2-45f1-b45b-562ef43a3d19":
        return {
          text: "No clasificado",
          color: "#92400e",
          icon: <Clock size={16} />,
          backgroundColor: "#fef2ca"
        };
      case "532d6b7f-03da-4d22-9c28-2ef69590608f":
        return {
          text: "En revisión",
          color: "#2143b0",
          icon: <MagnifyingGlass size={16} />,
          backgroundColor: "#e2ecfe"
        };
      case "5081de05-745d-449c-aff5-086e0d8b47a0":
        return {
          text: "Rechazado",
          color: "#e7092b",
          icon: <XCircle size={16} />,
          backgroundColor: "#fce6e9"
        };
      case "ca007d5c-6102-4de2-87b1-7150fb5d31a7":
        return {
          text: "Aprobado IA",
          color: "#6f25b6",
          icon: <Sparkle size={16} />,
          backgroundColor: "#f0eafb"
        };
      case "cdc3af46-5ba3-416b-bc76-0aa825efb1aa":
        return {
          text: "Rechazado IA",
          color: "#1e5d90",
          icon: <Sparkle size={16} />,
          backgroundColor: "#dfe5ea"
        };
      case "c02b3475-f59a-4222-bb28-9dbb51cf02c1":
        return {
          text: "Pendiente",
          color: "#92400e",
          icon: <Clock size={16} />,
          backgroundColor: "#fef2ca"
        };
      case "dcf4e68b-11cb-4352-8ea7-f6356fa98db9":
        return {
          text: "Vigente",
          color: "#065f46",
          icon: <CheckCircle size={16} />,
          backgroundColor: "#d9f4e8"
        };
      default:
        return {
          text: "Desconocido",
          color: "#000",
          icon: <Sparkle size={16} />,
          backgroundColor: "#fff"
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
