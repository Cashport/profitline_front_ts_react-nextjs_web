"use client";

import { useEffect, useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { uploadMedicalAccount } from "@/services/medicalAccounts/medicalAccounts";
import { SERVICE_TYPE_CODES } from "../../constants";

const { Title } = Typography;

interface ModalAddMedicalAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ModalAddMedicalAccount({
  isOpen,
  onClose,
  onSuccess
}: ModalAddMedicalAccountProps) {
  const t = useTranslations("medicalAccounts");
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  // Reset local state whenever the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setSelectedServiceType(null);
      setOrderNumber("");
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError(t("upload.onlyPdf"));
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleOk = async () => {
    if (!selectedFile || !orderNumber.trim()) return;
    if (!projectId) {
      showMessage("error", t("addModal.selectProject"));
      return;
    }

    setIsLoading(true);
    try {
      await uploadMedicalAccount(
        selectedFile,
        projectId,
        orderNumber.trim(),
        selectedServiceType ?? undefined
      );
      showMessage("success", t("addModal.success"));
      onSuccess?.();
      onClose();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("addModal.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={isLoading ? undefined : onClose}
      title={<Title level={4}>{t("addModal.title")}</Title>}
      footer={
        <FooterButtons
          titleConfirm={t("addModal.confirm")}
          showLeftButton={false}
          isConfirmDisabled={!selectedFile || !selectedServiceType || !orderNumber.trim()}
          isConfirmLoading={isLoading}
          onClose={onClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem" style={{ marginBottom: "1rem" }}>
        <p className="-mt-2 text-sm text-gray-500">{t("addModal.description")}</p>

        {/* Número de pedido */}
        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("addModal.orderNumber")} <span className="text-red-500">*</span>
          </p>
          <Input
            placeholder={t("addModal.orderNumberPlaceholder")}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>

        {/* Tipo de servicio */}
        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("addModal.serviceType")} <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {SERVICE_TYPE_CODES.map((code) => {
              const isSelected = selectedServiceType === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedServiceType(code)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 px-2 py-3 text-center transition ${
                    isSelected
                      ? "border-cashport-black bg-cashport-black text-white shadow-md"
                      : "border-gray-200 bg-gray-50 text-cashport-black hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cashport-green" />
                  )}
                  <span className="text-sm font-bold">{code}</span>
                  <span
                    className={`mt-0.5 text-[13px] leading-tight ${
                      isSelected ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {t(`serviceTypes.${code}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archivo PDF */}
        <div>
          <p className="mb-2 text-[13px] font-semibold text-gray-500">
            {t("addModal.pdfFile")} <span className="text-red-500">*</span>
          </p>

          {selectedFile ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
              <FileText size={24} className="shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cashport-black">
                  {selectedFile.name}
                </p>
                <p className="text-[13px] text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label={t("upload.removeFile")}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <UploadDropZone
                onFileUpload={handleFileUpload}
                allowedExtensions={[".pdf"]}
                title={t("upload.dropTitle")}
                subtitle={t("upload.dropSubtitleFromDevice")}
              />
              <p className="mt-2 text-center text-[13px] text-gray-400">{t("addModal.pdfHint")}</p>
            </>
          )}

          {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
        </div>

        {isLoading && (
          <p className="text-center text-[13px] text-gray-500">{t("addModal.processing")}</p>
        )}
      </Flex>
    </Modal>
  );
}
