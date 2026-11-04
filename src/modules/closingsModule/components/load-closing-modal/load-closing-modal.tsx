"use client";

import { Modal } from "antd";
import { FileXls, UploadSimple } from "phosphor-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSeeTemplate: () => void;
}

const STEPS = [
  "Descarga la cartera y los pagos al cierre desde el ERP de la compañía.",
  "Pégalos en la plantilla (hojas Cartera, Pagos y Comentarios) sin cambiar los encabezados.",
  "Sube el archivo: Cashport valida columnas y totales y te muestra el resumen antes de publicar.",
  "Al publicar, el cierre queda fijo: no cambia aunque luego se apliquen pagos en Cashport."
];

/** Maqueta de la carga del cierre: todavía no sube nada (no hay backend). */
export default function LoadClosingModal({ open, onClose, onSeeTemplate }: Props) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={560} centered>
      <h2 className="text-[18px] font-semibold text-cp-ink">Cargar cierre</h2>
      <p className="mt-1 text-[13px] text-cp-ink-3">
        Próximamente. Así se verá la carga del cierre del mes.
      </p>

      <ol className="mt-4 flex flex-col gap-2.5">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 text-[13px] leading-[1.5] text-cp-ink-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cp-bg text-[13px] font-semibold text-cp-ink">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-cp-line-2 bg-[#fafafa] px-4 py-7 text-center opacity-70">
        <UploadSimple size={26} className="text-cp-ink-3" />
        <p className="text-[13.5px] font-semibold text-cp-ink">Arrastra aquí el Excel del cierre</p>
        <p className="text-[13px] text-cp-ink-3">
          .xlsx · hasta 100 MB · disponible cuando exista la carga
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSeeTemplate}
          className="flex h-10 items-center gap-2 text-[14px] font-semibold text-cp-ink"
        >
          <FileXls size={18} /> Ver la plantilla
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-[10px] bg-cp-lime px-5 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
}
