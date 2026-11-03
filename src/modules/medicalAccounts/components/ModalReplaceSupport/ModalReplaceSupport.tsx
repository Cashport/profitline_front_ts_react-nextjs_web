"use client";

import { useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useMessageApi } from "@/context/MessageContext";
import { replaceMedicalAccountSupport } from "@/services/medicalAccounts/medicalAccounts";

const { Title } = Typography;

interface ModalReplaceSupportProps {
  isOpen: boolean;
  accountId: number;
  documentId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ModalReplaceSupport({
  isOpen,
  accountId,
  documentId,
  onClose,
  onSuccess
}: ModalReplaceSupportProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const t = useTranslations("medicalAccounts");
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();

  const handleFileUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showMessage("error", t("upload.onlyPdf"));
      return;
    }
    setPdfFile(file);
  };

  const handleOk = async () => {
    if (!pdfFile || documentId == null) return;

    setIsLoading(true);
    try {
      await replaceMedicalAccountSupport(accountId, documentId, pdfFile);
      showMessage("success", t("replaceSupportModal.success"));
      onSuccess();
      onClose();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("replaceSupportModal.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPdfFile(null);
      onClose();
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={520}
      onCancel={handleClose}
      title={<Title level={4}>{t("replaceSupportModal.title")}</Title>}
      footer={
        <FooterButtons
          titleConfirm={t("replaceSupportModal.confirm")}
          showLeftButton={false}
          isConfirmDisabled={!pdfFile || documentId == null}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem">
        <p className="-mt-2 text-sm text-gray-500">{t("replaceSupportModal.description")}</p>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            PDF <span className="text-red-500">*</span>
          </p>

          {pdfFile ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
              <FileText size={24} className="shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cashport-black">{pdfFile.name}</p>
                <p className="text-[13px] text-gray-500">{formatFileSize(pdfFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label={t("upload.removeFile")}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <UploadDropZone
              onFileUpload={handleFileUpload}
              allowedExtensions={[".pdf"]}
              title={t("upload.dropTitle")}
              subtitle={t("upload.dropSubtitle")}
            />
          )}
        </div>
      </Flex>
    </Modal>
  );
}
