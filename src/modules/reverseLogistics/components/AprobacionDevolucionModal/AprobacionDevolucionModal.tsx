"use client";

import { useEffect, useState } from "react";
import { Modal, Select, Input, Button } from "antd";
import { IProfit360FilterItem } from "@/types/reverseLogistics/IReverseLogistics";

interface AprobacionDevolucionModalProps {
  open: boolean;
  // GUID for "Aprobado" — looked up dynamically from the filters context so
  // the modal keeps working if the backend ever rotates that ID.
  aprobadoEstadoCodigo: string;
  // Dropdown options for the causal approval picker.
  causales: IProfit360FilterItem[];
  // Initial selection for the dropdown. The parent resolves it from the
  // devolucion's own causal (the legacy visits endpoint exposes
  // `IdCausalDevolucion`; the approval-resumen endpoint exposes a JSON blob
  // we parse to grab the first causal name).
  defaultCausalCodigo?: string;
  // Called with the final form values. The parent owns the POST request and
  // any post-success UX (toast, refresh, navigate, …).
  onApprove: (params: {
    estadoCodigo: string;
    causalCodigo: string;
    observaciones: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function AprobacionDevolucionModal({
  open,
  aprobadoEstadoCodigo,
  causales,
  defaultCausalCodigo,
  onApprove,
  onClose
}: AprobacionDevolucionModalProps) {
  const [causal, setCausal] = useState<string | undefined>(undefined);
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync local form state with the default the parent supplies each time the
  // modal opens against a fresh devolucion. Cleared on close so a stale value
  // can't leak into the next open.
  useEffect(() => {
    if (open) {
      setCausal(defaultCausalCodigo);
      setObservacion("");
    } else {
      setCausal(undefined);
      setObservacion("");
    }
  }, [open, defaultCausalCodigo]);

  const handleAprobar = async () => {
    if (!causal || !aprobadoEstadoCodigo) return;
    setSubmitting(true);
    try {
      await onApprove({
        estadoCodigo: aprobadoEstadoCodigo,
        causalCodigo: causal,
        observaciones: observacion
      });
      onClose();
    } catch (error) {
      // Parent already logs; keep the modal open so the user can retry / edit.
      console.error("Error approving devolucion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="¿Confirma aprobación?"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={420}
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Causal Aprobación</label>
          <Select
            value={causal}
            onChange={setCausal}
            options={causales.map((c) => ({ value: c.codigo, label: c.nombre }))}
            placeholder="Selecciona una causal"
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Observación</label>
          <Input.TextArea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Digite la observación aquí..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="primary"
            onClick={handleAprobar}
            loading={submitting}
            disabled={!causal || !aprobadoEstadoCodigo}
            style={{ backgroundColor: "#1d4ed8" }}
          >
            Aprobar
          </Button>
          <Button danger onClick={onClose}>
            No Aprobar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
