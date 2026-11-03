"use client";

import { useState } from "react";
import { Modal, message } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "use-intl";

import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";
import { formatBytesToMB } from "../../references/references.utils";
import { useReferenceScopeLabels } from "../../hooks/useReferenceScopeLabels";

interface ModalReferenceDetailProps {
  isOpen: boolean;
  onClose: () => void;
  reference: IReferenceFile | null;
  ownerLabel: string;
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-";

export function ModalReferenceDetail({
  isOpen,
  onClose,
  reference,
  ownerLabel
}: ModalReferenceDetailProps) {
  const t = useTranslations("dataQuality.references.detail");
  const tCommon = useTranslations("common");
  const scopeLabels = useReferenceScopeLabels();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!reference?.file_url) {
      message.error(t("noFile"));
      return;
    }
    setDownloading(true);
    const hide = message.open({
      type: "loading",
      content: t("downloading"),
      duration: 0
    });
    try {
      // Mismo mecanismo de descarga que los auxiliares existentes.
      const response = await fetch(reference.file_url);
      if (!response.ok) throw new Error(t("downloadFailed"));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", reference.original_filename || "referencia");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("downloadError"));
    } finally {
      hide();
      setDownloading(false);
    }
  };

  const rows: { label: string; value: string }[] = reference
    ? [
        { label: t("type"), value: reference.reference_type },
        { label: t("scope"), value: scopeLabels.label(reference.scope_level) },
        { label: t("owner"), value: ownerLabel },
        { label: t("version"), value: String(reference.version) },
        {
          label: t("status"),
          value: reference.is_active === 1 ? tCommon("status.active") : tCommon("status.inactive")
        },
        { label: t("file"), value: reference.original_filename },
        { label: t("size"), value: formatBytesToMB(reference.size_bytes) },
        { label: t("sheet"), value: reference.sheet_name ?? "-" },
        {
          label: t("headerRow"),
          value:
            reference.header_row === null || reference.header_row === undefined
              ? "-"
              : String(reference.header_row)
        },
        { label: t("description"), value: reference.description ?? "-" },
        { label: t("created"), value: formatDate(reference.created_at) },
        { label: t("updated"), value: formatDate(reference.updated_at) }
      ]
    : [];

  return (
    <Modal open={isOpen} onCancel={onClose} title={t("title")} footer={null} destroyOnClose>
      {reference && (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="text-sm">
                <dt className="text-gray-500">{row.label}</dt>
                <dd className="text-[#141414] break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("actions.close")}
            </Button>
            <Button
              type="button"
              className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
              onClick={handleDownload}
              disabled={downloading || !reference.file_url}
            >
              {downloading ? t("downloadingShort") : tCommon("actions.download")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
