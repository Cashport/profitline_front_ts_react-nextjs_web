"use client";

import { useEffect, useState } from "react";
import { Modal, message } from "antd";

import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";
import {
  REFERENCE_ALLOWED_EXTENSIONS,
  isAllowedReferenceFile
} from "../../references/references.utils";

interface ModalReplaceReferenceProps {
  isOpen: boolean;
  onClose: () => void;
  reference: IReferenceFile | null;
  ownerLabel: string;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (file: File) => Promise<void>;
}

export function ModalReplaceReference({
  isOpen,
  onClose,
  reference,
  ownerLabel,
  onSubmit
}: ModalReplaceReferenceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setConfirming(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleFile = (selected: File) => {
    if (!isAllowedReferenceFile(selected)) {
      setFile(null);
      setError(`Formato no permitido. Usa ${REFERENCE_ALLOWED_EXTENSIONS.join(", ")}.`);
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleConfirm = async () => {
    if (submitting || !file) return;
    setSubmitting(true);
    try {
      await onSubmit(file);
      message.success("Archivo reemplazado exitosamente.");
      onClose();
    } catch (err) {
      // El conflicto de concurrencia (409) se informa y NO se reintenta solo.
      message.error(err instanceof Error ? err.message : "No se pudo reemplazar el archivo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={submitting ? undefined : onClose}
      title="Reemplazar archivo de referencia"
      footer={null}
      destroyOnClose
      maskClosable={!submitting}
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-[#F5F5F4] p-3 text-sm text-[#141414]">
          <p>
            <span className="font-medium">Tipo:</span> {reference?.reference_type ?? "-"}
          </p>
          <p>
            <span className="font-medium">Ámbito:</span> {ownerLabel}
          </p>
          <p>
            <span className="font-medium">Versión actual:</span> {reference?.version ?? "-"}
          </p>
        </div>

        {!confirming ? (
          <>
            <UploadDropZone
              onFileUpload={handleFile}
              allowedExtensions={[...REFERENCE_ALLOWED_EXTENSIONS]}
              title="Arrastra el nuevo archivo Excel aquí"
            />
            {file && <p className="text-sm text-[#141414]">{file.name}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
                disabled={!file || submitting}
                onClick={() => setConfirming(true)}
              >
                Continuar
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#141414]">
              Se reemplazará el archivo y la versión pasará de{" "}
              <span className="font-medium">{reference?.version ?? "-"}</span> a{" "}
              <span className="font-medium">{(reference?.version ?? 0) + 1}</span>. ¿Confirmas el
              reemplazo?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Volver
              </Button>
              <Button
                type="button"
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting ? "Reemplazando..." : "Confirmar reemplazo"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
