"use client";

import { useEffect, useState } from "react";
import { Modal, message } from "antd";

import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";

interface ModalToggleReferenceStatusProps {
  isOpen: boolean;
  onClose: () => void;
  reference: IReferenceFile | null;
  ownerLabel: string;
  onConfirm: () => Promise<void>;
}

export function ModalToggleReferenceStatus({
  isOpen,
  onClose,
  reference,
  ownerLabel,
  onConfirm
}: ModalToggleReferenceStatusProps) {
  const [submitting, setSubmitting] = useState(false);
  const willDeactivate = reference?.is_active === 1;

  useEffect(() => {
    if (!isOpen) setSubmitting(false);
  }, [isOpen]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
      message.success(willDeactivate ? "Referencia desactivada." : "Referencia activada.");
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo cambiar el estado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={submitting ? undefined : onClose}
      title={willDeactivate ? "Desactivar referencia" : "Activar referencia"}
      footer={null}
      destroyOnClose
      maskClosable={!submitting}
    >
      <div className="space-y-4">
        <p className="text-sm text-[#141414]">
          {willDeactivate
            ? "La referencia dejará de utilizarse en la resolución, pero no se elimina su archivo ni su historial."
            : "La referencia volverá a estar disponible para la resolución."}
        </p>
        <div className="rounded-lg bg-[#F5F5F4] p-3 text-sm text-[#141414]">
          <p>
            <span className="font-medium">Tipo:</span> {reference?.reference_type ?? "-"}
          </p>
          <p>
            <span className="font-medium">Ámbito:</span> {ownerLabel}
          </p>
          <p>
            <span className="font-medium">Versión:</span> {reference?.version ?? "-"}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? "Procesando..." : willDeactivate ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
