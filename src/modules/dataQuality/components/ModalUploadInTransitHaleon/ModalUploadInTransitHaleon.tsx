"use client";

import React, { useState } from "react";
import { Modal, message } from "antd";
import { FileText } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";

interface ModalUploadInTransitHaleonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalUploadInTransitHaleon: React.FC<ModalUploadInTransitHaleonProps> = ({
  isOpen,
  onClose
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFile(null);
    setLoading(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    // MOCK: no llamar al Backend por ahora.
    setTimeout(() => {
      setLoading(false);
      message.success("Archivo cargado correctamente (MOCK)");
      handleClose();
    }, 800);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={`Cargar "In Transit Haleon"`}
      footer={null}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Adjunta el archivo In Transit Haleon para cargarlo.
        </p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: "none" }}
          />
          <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            <FileText size={18} />
            Seleccionar archivo
          </span>
        </label>

        {file && (
          <p className="text-sm text-gray-800">
            Archivo seleccionado: <span className="font-medium">{file.name}</span>
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Cargando..." : "Cargar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
