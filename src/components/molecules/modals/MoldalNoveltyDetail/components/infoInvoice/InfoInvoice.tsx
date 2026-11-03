import React, { useState } from "react";
import { NewspaperClipping, Coins } from "phosphor-react";
import { Switch, Tag, Typography } from "antd";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { IIncidentDetail, IIncidentDocument } from "@/hooks/useNoveltyDetail";

import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";

import "./infoinvoice.scss";
const { Text } = Typography;

interface InfoInvoiceProps {
  incidentData: IIncidentDetail;
}

const INACTIVE_REASONS = ["PAID", "MANUALLY_REMOVED", "CANCELLED", "OTHER"] as const;
type InactiveReason = (typeof INACTIVE_REASONS)[number];
const isInactiveReason = (value?: string | null): value is InactiveReason =>
  !!value && (INACTIVE_REASONS as readonly string[]).includes(value);

export const InfoInvoice: React.FC<InfoInvoiceProps> = ({ incidentData }) => {
  const t = useTranslations("modals.noveltyDetail.invoices");
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
      <IconLabel icon={<Coins size={20} />} text={t("values")} />
      <div className="values-container">
        <div className="value-row">
          <Text>{t("initialAmount")}</Text>
          <Text strong>{formatMoney(incidentData.initial_amount)}</Text>
        </div>
        <div className="value-row">
          <Text>{t("currentAmount")}</Text>
          <Text strong>{formatMoney(incidentData.actual_amount)}</Text>
        </div>
        <div className="value-row difference">
          <Text>{t("recovered")}</Text>
          <Text type={recoveredAmount > 0 ? "success" : undefined} strong>
            {formatMoney(recoveredAmount)}
          </Text>
        </div>
      </div>

      <div className="documents-header">
        <IconLabel
          icon={<NewspaperClipping size={20} />}
          text={t("documents", {
            active: incidentData.actual_count,
            total: incidentData.initial_count
          })}
        />
        {closedDocuments.length > 0 && (
          <label className="closed-toggle">
            <Switch size="small" checked={showClosed} onChange={setShowClosed} />
            <Text>{t("showClosed", { count: closedDocuments.length })}</Text>
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
              className={
                doc.document_type === "FINANCIAL_RECORD" ? "document-id clickable" : "document-id"
              }
              onClick={() => handleOpenDocumentDetail(doc)}
            >
              {doc.id_erp ?? doc.document_id}
            </Text>
            <Tag color={doc.document_type === "FINANCIAL_RECORD" ? "blue" : "purple"}>
              {doc.document_type === "FINANCIAL_RECORD" ? t("invoice") : t("deduction")}
            </Tag>
            <Text strong>{formatMoney(doc.actual_amount)}</Text>
            {!doc.active && (
              <Tag color="default">
                {isInactiveReason(doc.inactive_reason)
                  ? t(`inactiveReasons.${doc.inactive_reason}`)
                  : t("closed")}
              </Tag>
            )}
          </div>
        ))}
        {visibleDocuments.length === 0 && <Text type="secondary">{t("noActiveDocuments")}</Text>}
      </div>
    </div>
  );
};
