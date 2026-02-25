"use client";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { FileText, Plus, Paperclip } from "lucide-react";
import { CaretDoubleRight } from "phosphor-react";

const estadoConfig: Record<any, { color: string; textColor: string }> = {
  "Pendiente NC": { color: "#FF9800", textColor: "text-white" },
  Pendiente: { color: "#FFC107", textColor: "text-white" },
  "En revisión": { color: "#2196F3", textColor: "text-white" },
  Aprobado: { color: "#4CAF50", textColor: "text-white" },
  Aplicado: { color: "#2E7D32", textColor: "text-white" },
  Rechazado: { color: "#E53935", textColor: "text-white" },
  "Aplicado parcial": { color: "#9C27B0", textColor: "text-white" }
};

interface BalanceDetailModalProps {
  saldoData: any;
  onBack: () => void;
  isModal?: boolean;
}

export function BalanceDetailModal({
  saldoData,
  onBack,
  isModal = false
}: BalanceDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const estadoStyle = estadoConfig[saldoData.estado];

  // Calcular aplicado y pendiente a partir de las NCs asignadas
  const totalAplicadoNC =
    saldoData.notasCredito?.reduce((sum: any, nc: any) => sum + (nc.monto || 0), 0) ?? 0;
  const pendienteNC = saldoData.montoOriginal - totalAplicadoNC;

  return (
    <div className={isModal ? "bg-white" : "min-h-screen bg-white"}>
      {/* Header */}
      <div className={isModal ? "px-6 pt-5 pb-4" : "px-6 lg:px-8 pt-5 pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center bg-white border-none cursor-pointer hover:bg-[#f7f7f7]"
            >
              <CaretDoubleRight size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-cashport-black">{saldoData.id}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{saldoData.cliente}</p>
            </div>
          </div>
          <Badge
            className="text-xs px-2.5 py-1 whitespace-nowrap"
            style={{ backgroundColor: estadoStyle.color, color: "white" }}
          >
            {saldoData.estado}
          </Badge>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Content */}
      <div className={isModal ? "px-6 py-5" : "px-6 lg:px-8 py-5"}>
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-gray-400">Tipo</p>
              <p className="text-sm font-semibold text-cashport-black">
                {saldoData.tipoNotaCredito}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">KAM</p>
              <p className="text-sm font-semibold text-cashport-black">{saldoData.kam}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha registro</p>
              <p className="text-sm font-semibold text-cashport-black">
                {formatDate(saldoData.fechaEmision)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vencimiento</p>
              <p className="text-sm font-semibold text-cashport-black">
                {saldoData.fechaVencimiento ? formatDate(saldoData.fechaVencimiento) : "-"}
              </p>
            </div>
          </div>

          {/* Motivo */}
          {saldoData.motivo && (
            <div>
              <p className="text-xs text-gray-400">Motivo</p>
              <p className="text-sm text-cashport-black mt-0.5">{saldoData.motivo}</p>
            </div>
          )}

          <div className="h-px bg-gray-100" />

          {/* Soportes */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Soportes
            </p>

            {saldoData.soportes?.length ? (
              <div className="space-y-1">
                {saldoData.soportes.map((archivo: any) => (
                  <a
                    key={archivo.nombre}
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Paperclip className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    <span className="text-sm text-cashport-black">{archivo.nombre}</span>
                    {archivo.tipo && (
                      <span className="text-xs text-gray-300 uppercase">{archivo.tipo}</span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-2">Sin archivos de soporte</p>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Montos */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Monto original</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(saldoData.montoOriginal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Aplicado</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(totalAplicadoNC)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pendiente</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(pendienteNC)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Notas de credito */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Notas de credito
              </p>
              <Button
                size="sm"
                className="h-8 text-xs bg-cashport-black hover:bg-gray-800 text-white rounded-lg px-3"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Agregar NC
              </Button>
            </div>

            {saldoData.notasCredito?.length ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-400 py-2 px-3">
                        ID Nota
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 py-2 px-3">
                        ID Documento
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 py-2 px-3">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {saldoData.notasCredito.map((nc: any, idx: any) => (
                      <tr
                        key={nc.numero}
                        className={
                          idx < (saldoData.notasCredito?.length ?? 0) - 1
                            ? "border-b border-gray-50"
                            : ""
                        }
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-gray-300" />
                            <span className="text-sm text-cashport-black">{nc.numero}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-sm text-gray-500">{nc.idDocumento}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-sm font-medium text-cashport-black">
                            {formatCurrency(nc.monto)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-5 rounded-lg border border-dashed border-gray-200 text-center">
                <p className="text-sm text-gray-400">Sin notas de credito asignadas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
