"use client";

import { ReactNode, useEffect, useState } from "react";
import { Input, Modal } from "antd";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";

interface ModalMotivoDevolucionProps {
  open: boolean;
  title: string;
  // Texto o detalle encima del motivo (p. ej. la lista de cambios a guardar).
  description?: ReactNode;
  label: string;
  placeholder?: string;
  okText: string;
  danger?: boolean;
  onClose: () => void;
  // El padre hace la petición y avisa el resultado. Si lanza, el modal queda
  // abierto para reintentar.
  onConfirm: (motivo: string) => Promise<void>;
}

// Confirmación con motivo obligatorio: "Guardar cambios" y "Anular devolución".
export function ModalMotivoDevolucion({
  open,
  title,
  description,
  label,
  placeholder,
  okText,
  danger,
  onClose,
  onConfirm
}: ModalMotivoDevolucionProps) {
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setMotivo("");
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(motivo.trim());
      onClose();
    } catch (error) {
      // El padre ya mostró el error; el modal sigue abierto para reintentar.
      console.error("Error confirming devolucion action:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={520}
    >
      <div className="flex flex-col gap-4 py-2">
        {description ? <div className="text-sm text-gray-600">{description}</div> : null}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {label} <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={placeholder}
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrincipalButton
            onClick={handleConfirm}
            loading={submitting}
            disabled={!motivo.trim()}
            danger={danger}
          >
            {okText}
          </PrincipalButton>
        </div>
      </div>
    </Modal>
  );
}
