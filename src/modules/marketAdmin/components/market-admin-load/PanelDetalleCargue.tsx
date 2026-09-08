"use client";

import { useEffect } from "react";
import { Spin } from "antd";
import { ChevronsRight, Download, FileSpreadsheet, Info, Upload } from "lucide-react";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import {
  useProfitLoader,
  useProfitLoaderTimeline
} from "@/modules/marketAdmin/hooks/useProfitLoaders";
import { EstadoPill, formatDateTime, statusColorClasses } from "./dataLoadUtils";

type Props = {
  open: boolean;
  loaderId: number | null;
  isUploading?: boolean;
  onClose: () => void;
  onUpload: (id: number) => void;
  onDownloadTemplate: (nombre: string) => void;
};

const sectionLabelClass = "text-xs font-semibold text-[#999999] uppercase tracking-wide mb-1";
const iconButtonClass =
  "flex items-center justify-center w-6 h-6 rounded-md text-[#999999] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0";

export default function PanelDetalleCargue({
  open,
  loaderId,
  isUploading,
  onClose,
  onUpload,
  onDownloadTemplate
}: Props) {
  const { loader, isLoading: loadingLoader } = useProfitLoader(open ? loaderId : null);
  const { timeline, isLoading: loadingTimeline } = useProfitLoaderTimeline(open ? loaderId : null);

  const ultimoCargue = timeline[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-screen w-full max-w-[630px] flex-col bg-white shadow-[0px_4px_82px_0px_#0000003d] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start gap-3 px-6 py-5 border-b border-[#EEEEEE]">
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
          >
            <ChevronsRight size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#141414]">{loader?.display_name}</h2>
            <p className="text-xs text-[#999999] mt-0.5">{loader?.description}</p>
          </div>
        </div>

        {loadingLoader || !loader ? (
          <div className="flex flex-1 items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Info general */}
            <div className="px-6 py-5 border-b border-[#EEEEEE]">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <Info size={14} className="text-[#141414]" />
                </div>
                <div>
                  <p className={sectionLabelClass}>¿Qué hace este ETL?</p>
                  <p className="text-sm text-[#141414] leading-relaxed">{loader.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className={sectionLabelClass}>Último archivo</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {ultimoCargue ? (
                      <>
                        <FileSpreadsheet size={13} className="text-[#1A7A1A] flex-shrink-0" />
                        <span className="text-sm text-[#141414] truncate">
                          {ultimoCargue.file_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => window.open(ultimoCargue.s3_url, "_blank")}
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
                  <span className="text-sm text-[#141414]">
                    {ultimoCargue ? formatDateTime(ultimoCargue.uploaded_at) : "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDownloadTemplate(loader.display_name)}
                  className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-[#E0E0E0] text-[#555555] hover:border-[#141414] hover:text-[#141414] transition-colors"
                >
                  <Download size={14} /> Template
                </button>
                {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
                <div className="h-10 flex-1">
                  <PrincipalButton
                    fullWidth
                    loading={isUploading}
                    onClick={() => onUpload(loader.id)}
                    icon={<Upload size={14} />}
                  >
                    Cargar
                  </PrincipalButton>
                </div>
              </div>
            </div>

            {/* Log de cargues */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-bold text-[#141414] mb-4">Historial de cargues</h3>

              {loadingTimeline ? (
                <div className="flex items-center justify-center py-10">
                  <Spin />
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-sm text-[#999999] text-center py-10">
                  Aún no se han registrado cargues para este ETL.
                </p>
              ) : (
                <div className="flex flex-col">
                  {timeline.map((item, i) => (
                    <div key={item.file_id} className="relative flex gap-3 pb-6 last:pb-0">
                      {i < timeline.length - 1 && (
                        <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[#E8E8E8]" />
                      )}
                      <div
                        className={`w-[15px] h-[15px] rounded-full flex-shrink-0 mt-0.5 ring-4 ring-white ${statusColorClasses(item.color).split(" ")[0]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[#141414] truncate">
                            {item.file_name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <EstadoPill label={item.label} color={item.color} />
                            <button
                              type="button"
                              onClick={() => window.open(item.s3_url, "_blank")}
                              title={`Descargar ${item.file_name}`}
                              className={iconButtonClass}
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-[#999999] mt-0.5">
                          {formatDateTime(item.uploaded_at)} · {item.uploaded_by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
