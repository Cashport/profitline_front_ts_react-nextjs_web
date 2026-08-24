"use client";

import { useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useMessageApi } from "@/context/MessageContext";
import { uploadMedicalAccountSupport } from "@/services/medicalAccounts/medicalAccounts";

const { Title } = Typography;

interface ModalUploadSupportProps {
  isOpen: boolean;
  accountId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ModalUploadSupport({
  isOpen,
  accountId,
  onClose,
  onSuccess
}: ModalUploadSupportProps) {
  const [documentType, setDocumentType] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();

  const handleFileUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showMessage("error", "Solo se permiten archivos PDF.");
      return;
    }
    setPdfFile(file);
  };

  const handleOk = async () => {
    if (!pdfFile || !documentType.trim()) return;

    setIsLoading(true);
    try {
      await uploadMedicalAccountSupport(accountId, pdfFile, documentType.trim());
      showMessage("success", "Soporte cargado correctamente.");
      onSuccess();
      onClose();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al cargar el soporte."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDocumentType("");
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
      title={<Title level={4}>Cargar soporte</Title>}
      footer={
        <FooterButtons
          titleConfirm="Cargar soporte"
          showLeftButton={false}
          isConfirmDisabled={!pdfFile || !documentType.trim()}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem">
        <p className="-mt-2 text-sm text-gray-500">
          Adjunta el PDF e indica el tipo de documento.
        </p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tipo de documento <span className="text-red-500">*</span>
          </p>
          <Input
            placeholder="Ej: soporte_medico"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            PDF <span className="text-red-500">*</span>
          </p>

          {pdfFile ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
              <FileText size={24} className="shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cashport-black">{pdfFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(pdfFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Quitar archivo"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <UploadDropZone
              onFileUpload={handleFileUpload}
              allowedExtensions={[".pdf"]}
              title="Arrastra el PDF aquí"
              subtitle="o haz clic para seleccionarlo"
            />
          )}
        </div>
      </Flex>
    </Modal>
  );
}
