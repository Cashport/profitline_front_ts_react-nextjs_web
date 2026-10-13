"use client";

import { Download, FileCheck2 } from "lucide-react";

import { useMedicalAccountHistory } from "../../hooks/useMedicalAccountHistory";
import { formatDate } from "../../utils/format";

interface MedicalAccountRadicadoProps {
  accountId: number;
}

// La evidencia de radicación se guarda en el historial de estados
// (medical_account_status_history.evidence_url) al pasar a RADICADO.
const handleDownload = (url: string | null) => {
  if (url) window.open(url, "_blank");
};

export function MedicalAccountRadicado({ accountId }: MedicalAccountRadicadoProps) {
  const { history } = useMedicalAccountHistory(accountId);

  const radications = history.filter(
    (item) => item.to_status_code === "RADICADO" && item.evidence_url
  );

  if (radications.length === 0) return null;

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <span className="text-xs font-semibold text-gray-600">Radicación</span>
        <span className="text-[11px] font-medium text-gray-400">{radications.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Evidencia
              </th>
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Fecha de radicación
              </th>
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Radicado por
              </th>
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Archivo
              </th>
            </tr>
          </thead>
          <tbody>
            {radications.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="font-medium text-gray-700">Evidencia de radicación</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-gray-500">{formatDate(item.created_at)}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-gray-500">
                    {item.created_by_name ?? item.created_by ?? "Sistema"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => handleDownload(item.evidence_url)}
                    disabled={!item.evidence_url}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
