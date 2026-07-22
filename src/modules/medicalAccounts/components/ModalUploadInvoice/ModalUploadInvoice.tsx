"use client";

import { useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import { FileText, X } from "lucide-react";

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

function FileChip({
  file,
  label,
  onRemove
}: {
  file: File;
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      <FileText size={24} className="shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cashport-black">{file.name}</p>
        <p className="text-xs text-gray-500">
          {label} · {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Quitar archivo"
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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();

  const handlePdfUpload = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showMessage("error", "Solo se permiten archivos PDF.");
      return;
    }
    setPdfFile(file);
  };

  const handleXmlUpload = (file: File) => {
    const isXml =
      file.type === "text/xml" ||
      file.type === "application/xml" ||
      file.name.toLowerCase().endsWith(".xml");
    if (!isXml) {
      showMessage("error", "Solo se permiten archivos XML.");
      return;
    }
    setXmlFile(file);
  };

  const handleOk = async () => {
    if (!invoiceNumber.trim() || !pdfFile || !xmlFile) return;

    setIsLoading(true);
    try {
      const response = await uploadMedicalAccountInvoice(
        accountId,
        invoiceNumber.trim(),
        pdfFile,
        xmlFile
      );
      showMessage("success", "Factura cargada correctamente.");
      onSuccess(response.data);
      onClose();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al cargar la factura."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setInvoiceNumber("");
      setPdfFile(null);
      setXmlFile(null);
      onClose();
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={560}
      onCancel={handleClose}
      title={<Title level={4}>Subir factura</Title>}
      footer={
        <FooterButtons
          titleConfirm="Subir factura"
          showLeftButton={false}
          isConfirmDisabled={!invoiceNumber.trim() || !pdfFile || !xmlFile}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1.25rem">
        <p className="-mt-2 text-sm text-gray-500">
          Ingresa el número de factura y adjunta los archivos PDF y XML.
        </p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Número de factura <span className="text-red-500">*</span>
          </p>
          <Input
            placeholder="Ej: FAC-001"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            PDF de la factura <span className="text-red-500">*</span>
          </p>
          {pdfFile ? (
            <FileChip file={pdfFile} label="PDF" onRemove={() => setPdfFile(null)} />
          ) : (
            <UploadDropZone
              onFileUpload={handlePdfUpload}
              allowedExtensions={[".pdf"]}
              title="Arrastra el PDF aquí"
              subtitle="o haz clic para seleccionarlo"
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            XML de la factura <span className="text-red-500">*</span>
          </p>
          {xmlFile ? (
            <FileChip file={xmlFile} label="XML" onRemove={() => setXmlFile(null)} />
          ) : (
            <UploadDropZone
              onFileUpload={handleXmlUpload}
              allowedExtensions={[".xml"]}
              title="Arrastra el XML aquí"
              subtitle="o haz clic para seleccionarlo"
            />
          )}
        </div>
      </Flex>
    </Modal>
  );
}
