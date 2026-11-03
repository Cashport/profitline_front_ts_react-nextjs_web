"use client";

import { useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useMessageApi } from "@/context/MessageContext";
import { uploadMedicalAccountInvoice } from "@/services/medicalAccounts/medicalAccounts";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";

const { Title } = Typography;

interface ModalUploadInvoiceProps {
  isOpen: boolean;
  accountId: number;
  onClose: () => void;
  onSuccess: (updated: IMedicalAccountUploadData) => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

function FileChip({ file, label, onRemove }: { file: File; label: string; onRemove: () => void }) {
  const t = useTranslations("medicalAccounts");
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      <FileText size={24} className="shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cashport-black">{file.name}</p>
        <p className="text-[13px] text-gray-500">
          {label} · {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label={t("upload.removeFile")}
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function ModalUploadInvoice({
  isOpen,
  accountId,
  onClose,
  onSuccess
}: ModalUploadInvoiceProps) {
  const t = useTranslations("medicalAccounts");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();

  const handlePdfUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showMessage("error", t("upload.onlyPdf"));
      return;
    }
    setPdfFile(file);
  };

  const handleZipUpload = (file: File) => {
    const isZip =
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip");
    if (!isZip) {
      showMessage("error", t("upload.onlyZip"));
      return;
    }
    setZipFile(file);
  };

  const handleOk = async () => {
    if (!invoiceNumber.trim() || !pdfFile) return;

    setIsLoading(true);
    try {
      const response = await uploadMedicalAccountInvoice(
        accountId,
        invoiceNumber.trim(),
        pdfFile,
        zipFile
      );
      showMessage("success", t("invoiceModal.success"));
      onSuccess(response.data);
      onClose();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("invoiceModal.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setInvoiceNumber("");
      setPdfFile(null);
      setZipFile(null);
      onClose();
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={560}
      onCancel={handleClose}
      title={<Title level={4}>{t("invoiceModal.title")}</Title>}
      footer={
        <FooterButtons
          titleConfirm={t("invoiceModal.confirm")}
          showLeftButton={false}
          isConfirmDisabled={!invoiceNumber.trim() || !pdfFile}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem">
        <p className="-mt-2 text-sm text-gray-500">{t("invoiceModal.description")}</p>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("invoiceModal.invoiceNumber")} <span className="text-red-500">*</span>
          </p>
          <Input
            placeholder={t("invoiceModal.invoiceNumberPlaceholder")}
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("invoiceModal.invoicePdf")} <span className="text-red-500">*</span>
          </p>
          {pdfFile ? (
            <FileChip file={pdfFile} label="PDF" onRemove={() => setPdfFile(null)} />
          ) : (
            <UploadDropZone
              onFileUpload={handlePdfUpload}
              allowedExtensions={[".pdf"]}
              title={t("upload.dropTitle")}
              subtitle={t("upload.dropSubtitle")}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("invoiceModal.invoiceZip")}{" "}
            <span className="font-normal normal-case text-gray-400">
              {t("invoiceModal.optional")}
            </span>
          </p>
          {zipFile ? (
            <FileChip file={zipFile} label="ZIP" onRemove={() => setZipFile(null)} />
          ) : (
            <UploadDropZone
              onFileUpload={handleZipUpload}
              allowedExtensions={[".zip"]}
              title={t("upload.dropZipTitle")}
              subtitle={t("upload.dropSubtitle")}
            />
          )}
        </div>
      </Flex>
    </Modal>
  );
}
