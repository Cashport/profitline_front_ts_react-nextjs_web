"use client";

import { useEffect, useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { uploadMedicalAccount } from "@/services/medicalAccounts/medicalAccounts";
import { SERVICE_TYPES } from "../../constants";

const { Title } = Typography;

interface ModalAddMedicalAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ModalAddMedicalAccount({ isOpen, onClose }: ModalAddMedicalAccountProps) {
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  // Reset local state whenever the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setSelectedServiceType(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleOk = async () => {
    if (!selectedFile) return;
    if (!projectId) {
      showMessage("error", "Selecciona un proyecto antes de cargar la cuenta.");
      return;
    }

    setIsLoading(true);
    try {
      await uploadMedicalAccount(selectedFile, projectId);
      showMessage("success", "Cuenta médica cargada y procesada correctamente.");
      onClose();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al cargar la cuenta médica."
      );
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
      title={<Title level={4}>Nueva Cuenta Médica</Title>}
      footer={
        <FooterButtons
          titleConfirm="Cargar cuenta médica"
          showLeftButton={false}
          isConfirmDisabled={!selectedFile || !selectedServiceType}
          isConfirmLoading={isLoading}
          onClose={onClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem" style={{ marginBottom: "1rem" }}>
        <p className="-mt-2 text-sm text-gray-500">
          Selecciona el tipo de servicio y adjunta el PDF de la cuenta.
        </p>

        {/* Tipo de servicio */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tipo de servicio <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {SERVICE_TYPES.map((serviceType) => {
              const isSelected = selectedServiceType === serviceType.code;
              return (
                <button
                  key={serviceType.code}
                  type="button"
                  onClick={() => setSelectedServiceType(serviceType.code)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 px-2 py-3 text-center transition ${
                    isSelected
                      ? "border-cashport-black bg-cashport-black text-white shadow-md"
                      : "border-gray-200 bg-gray-50 text-cashport-black hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cashport-green" />
                  )}
                  <span className="text-sm font-bold">{serviceType.code}</span>
                  <span
                    className={`mt-0.5 text-[10px] leading-tight ${
                      isSelected ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {serviceType.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archivo PDF */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Archivo PDF <span className="text-red-500">*</span>
          </p>

          {selectedFile ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
              <FileText size={24} className="shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cashport-black">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Quitar archivo"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <UploadDropZone
                onFileUpload={handleFileUpload}
                allowedExtensions={[".pdf"]}
                title="Arrastra el PDF aquí"
                subtitle="o haz clic para seleccionarlo desde tu equipo"
              />
              <p className="mt-2 text-center text-xs text-gray-400">Solo PDF · Máx. 500 páginas</p>
            </>
          )}

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {isLoading && (
          <p className="text-center text-xs text-gray-500">
            Procesando la cuenta médica, esto puede tardar hasta 90 segundos…
          </p>
        )}
      </Flex>
    </Modal>
  );
}
