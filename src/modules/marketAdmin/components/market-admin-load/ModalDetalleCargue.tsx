"use client";

import { Modal } from "antd";
import { Download, FileSpreadsheet, Info, Upload } from "lucide-react";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { IMarketAdminEtl } from "@/types/marketAdmin/IMarketAdmin";
import { EstadoPill, formatDate } from "./dataLoadUtils";

type Props = {
  open: boolean;
  etl: IMarketAdminEtl | null;
  onClose: () => void;
  onUpload: (id: string) => void;
  onDownloadTemplate: (nombre: string) => void;
  onDownloadFile: (archivo: string) => void;
};

const sectionLabelClass = "text-xs font-semibold text-[#999999] uppercase tracking-wide mb-1";
const iconButtonClass =
  "flex items-center justify-center w-6 h-6 rounded-md text-[#999999] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0";

export default function ModalDetalleCargue({
  open,
  etl,
  onClose,
  onUpload,
  onDownloadTemplate,
  onDownloadFile
}: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      title={<span className="text-base font-bold text-[#141414]">{etl?.nombre}</span>}
    >
      {etl && (
        <>
          <p className="text-xs text-[#999999] -mt-1 mb-5">{etl.observacion}</p>

          {/* Info general */}
          <div className="pb-5 border-b border-[#EEEEEE]">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                <Info size={14} className="text-[#141414]" />
              </div>
              <div>
                <p className={sectionLabelClass}>¿Qué hace este ETL?</p>
                <p className="text-sm text-[#141414] leading-relaxed">{etl.detalle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className={sectionLabelClass}>Último archivo</p>
                <div className="flex items-center gap-1.5 min-w-0">
                  {etl.ultimoArchivo ? (
                    <>
                      <FileSpreadsheet size={13} className="text-[#1A7A1A] flex-shrink-0" />
                      <span className="text-sm text-[#141414] truncate">{etl.ultimoArchivo}</span>
                      <button
                        type="button"
                        onClick={() => onDownloadFile(etl.ultimoArchivo as string)}
                        title="Descargar archivo actual"
                        className={iconButtonClass}
                      >
                        <Download size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-[#BBBBBB]">Sin cargues aún</span>
                  )}
                </div>
              </div>
              <div>
                <p className={sectionLabelClass}>Último cargue</p>
                <span className="text-sm text-[#141414]">{formatDate(etl.ultimoCargue)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDownloadTemplate(etl.nombre)}
                className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-[#E0E0E0] text-[#555555] hover:border-[#141414] hover:text-[#141414] transition-colors"
              >
                <Download size={14} /> Template
              </button>
              {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
              <div className="h-10 flex-1">
                <PrincipalButton
                  fullWidth
                  onClick={() => onUpload(etl.id)}
                  icon={<Upload size={14} />}
                >
                  Cargar
                </PrincipalButton>
              </div>
            </div>
          </div>

          {/* Log de cargues */}
          <div className="pt-5">
            <h3 className="text-sm font-bold text-[#141414] mb-4">Historial de cargues</h3>

            {etl.historial.length === 0 ? (
              <p className="text-sm text-[#999999] text-center py-10">
                Aún no se han registrado cargues para este ETL.
              </p>
            ) : (
              <div className="flex flex-col">
                {etl.historial.map((h, i) => (
                  <div
                    key={`${h.archivo}-${h.fecha}`}
                    className="relative flex gap-3 pb-6 last:pb-0"
                  >
                    {i < etl.historial.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[#E8E8E8]" />
                    )}
                    <div
                      className={`w-[15px] h-[15px] rounded-full flex-shrink-0 mt-0.5 ring-4 ring-white ${
                        h.estado === "Exitoso" ? "bg-[#1A7A1A]" : "bg-[#B84A00]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[#141414] truncate">
                          {h.archivo}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <EstadoPill estado={h.estado} />
                          <button
                            type="button"
                            onClick={() => onDownloadFile(h.archivo)}
                            title={`Descargar ${h.archivo}`}
                            className={iconButtonClass}
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#999999] mt-0.5">
                        {formatDate(h.fecha)} · {h.usuario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
