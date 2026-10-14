"use client";

import { useState } from "react";
import { Modal, message } from "antd";
import dayjs from "dayjs";

import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";
import { formatBytesToMB, scopeLabel } from "../../references/references.utils";

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
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!reference?.file_url) {
      message.error("No hay archivo disponible para descargar.");
      return;
    }
    setDownloading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando archivo...",
      duration: 0
    });
    try {
      // Mismo mecanismo de descarga que los auxiliares existentes.
      const response = await fetch(reference.file_url);
      if (!response.ok) throw new Error("No se pudo descargar el archivo.");
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
      message.error(error instanceof Error ? error.message : "Error al descargar el archivo.");
    } finally {
      hide();
      setDownloading(false);
    }
  };

  const rows: { label: string; value: string }[] = reference
    ? [
        { label: "Tipo", value: reference.reference_type },
        { label: "Ámbito", value: scopeLabel(reference.scope_level) },
        { label: "Propietario", value: ownerLabel },
        { label: "Versión", value: String(reference.version) },
        { label: "Estado", value: reference.is_active === 1 ? "Activo" : "Inactivo" },
        { label: "Archivo", value: reference.original_filename },
        { label: "Tamaño", value: formatBytesToMB(reference.size_bytes) },
        { label: "Hoja", value: reference.sheet_name ?? "-" },
        {
          label: "Fila de encabezado",
          value: reference.header_row === null || reference.header_row === undefined
            ? "-"
            : String(reference.header_row)
        },
        { label: "Descripción", value: reference.description ?? "-" },
        { label: "Creado", value: formatDate(reference.created_at) },
        { label: "Actualizado", value: formatDate(reference.updated_at) }
      ]
    : [];

  return (
    <Modal open={isOpen} onCancel={onClose} title="Detalle de la referencia" footer={null} destroyOnClose>
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
              Cerrar
            </Button>
            <Button
              type="button"
              className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
              onClick={handleDownload}
              disabled={downloading || !reference.file_url}
            >
              {downloading ? "Descargando..." : "Descargar"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
