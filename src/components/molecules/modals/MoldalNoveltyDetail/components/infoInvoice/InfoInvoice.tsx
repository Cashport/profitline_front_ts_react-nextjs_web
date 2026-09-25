import React, { useState } from "react";
import { NewspaperClipping, Coins } from "phosphor-react";
import { Switch, Tag, Typography } from "antd";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { IIncidentDetail, IIncidentDocument } from "@/hooks/useNoveltyDetail";

import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";

import "./infoinvoice.scss";
const { Text } = Typography;

interface InfoInvoiceProps {
  incidentData: IIncidentDetail;
}

const INACTIVE_REASON_LABEL: Record<string, string> = {
  PAID: "Pagada",
  MANUALLY_REMOVED: "Retirada manualmente",
  CANCELLED: "Anulada",
  OTHER: "Otro"
};

export const InfoInvoice: React.FC<InfoInvoiceProps> = ({ incidentData }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { openModal } = useModalDetail();
  const [showClosed, setShowClosed] = useState(false);

  const documents = incidentData.documents ?? [];
  const closedDocuments = documents.filter((doc) => !doc.active);
  const visibleDocuments = showClosed ? documents : documents.filter((doc) => doc.active);
  const recoveredAmount = incidentData.initial_amount - incidentData.actual_amount;

  const handleOpenDocumentDetail = (doc: IIncidentDocument) => {
    if (doc.document_type !== "FINANCIAL_RECORD") return;
    openModal("invoice", {
      showId: doc.id_erp ?? String(doc.document_id),
      invoiceId: doc.document_id,
      projectId,
      clientId: incidentData.client_id,
      hiddenActions: true
    });
  };

  return (
    <div className="info-invoices">
      <IconLabel icon={<Coins size={20} />} text="Valores" />
      <div className="values-container">
        <div className="value-row">
          <Text>Monto inicial</Text>
          <Text strong>{formatMoney(incidentData.initial_amount)}</Text>
        </div>
        <div className="value-row">
          <Text>Monto actual</Text>
          <Text strong>{formatMoney(incidentData.actual_amount)}</Text>
        </div>
        <div className="value-row difference">
          <Text>Recuperado</Text>
          <Text type={recoveredAmount > 0 ? "success" : undefined} strong>
            {formatMoney(recoveredAmount)}
          </Text>
        </div>
      </div>

      <div className="documents-header">
        <IconLabel
          icon={<NewspaperClipping size={20} />}
          text={`Documentos (${incidentData.actual_count}/${incidentData.initial_count} activos)`}
        />
        {closedDocuments.length > 0 && (
          <label className="closed-toggle">
            <Switch size="small" checked={showClosed} onChange={setShowClosed} />
            <Text>Ver cerradas ({closedDocuments.length})</Text>
          </label>
        )}
      </div>

      <div className="documents-list">
        {visibleDocuments.map((doc) => (
          <div
            key={`${doc.document_type}-${doc.document_id}`}
            className={`document-row${doc.active ? "" : " document-row--inactive"}`}
          >
            <Text
              className={doc.document_type === "FINANCIAL_RECORD" ? "document-id clickable" : "document-id"}
              onClick={() => handleOpenDocumentDetail(doc)}
            >
              {doc.id_erp ?? doc.document_id}
            </Text>
            <Tag color={doc.document_type === "FINANCIAL_RECORD" ? "blue" : "purple"}>
              {doc.document_type === "FINANCIAL_RECORD" ? "Factura" : "Saldo"}
            </Tag>
            <Text strong>{formatMoney(doc.actual_amount)}</Text>
            {!doc.active && (
              <Tag color="default">
                {(doc.inactive_reason && INACTIVE_REASON_LABEL[doc.inactive_reason]) || "Cerrada"}
              </Tag>
            )}
          </div>
        ))}
        {visibleDocuments.length === 0 && <Text type="secondary">Sin documentos activos</Text>}
      </div>
    </div>
  );
};
