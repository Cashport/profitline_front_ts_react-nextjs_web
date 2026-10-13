"use client";

import { useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useMessageApi } from "@/context/MessageContext";
import { radicateBulkMedicalAccounts } from "@/services/medicalAccounts/medicalAccounts";

const { Title } = Typography;

interface ModalRadiateBulkProps {
  isOpen: boolean;
  ids: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ModalRadiateBulk({ isOpen, ids, onClose, onSuccess }: ModalRadiateBulkProps) {
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
    if (!pdfFile || ids.length === 0) return;

    setIsLoading(true);
    try {
      await radicateBulkMedicalAccounts(ids, pdfFile);
      showMessage("success", `${ids.length} cuenta(s) radicada(s) correctamente.`);
      onSuccess();
      onClose();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error en la radicación masiva."
      );
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
      title={<Title level={4}>Radicación masiva</Title>}
      footer={
        <FooterButtons
          titleConfirm="Radicar"
          showLeftButton={false}
          isConfirmDisabled={!pdfFile || ids.length === 0}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem">
        <p className="-mt-2 text-sm text-gray-500">
          Se radicarán <span className="font-semibold text-cashport-black">{ids.length}</span>{" "}
          cuenta(s) seleccionada(s) en estado Facturado. Adjunta el PDF de evidencia.
        </p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Evidencia PDF <span className="text-red-500">*</span>
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
