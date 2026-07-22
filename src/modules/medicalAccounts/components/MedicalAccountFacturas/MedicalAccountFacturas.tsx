"use client";

import { Download, FileText } from "lucide-react";

import { IMedicalAccountFacturaApi } from "@/types/medicalAccounts/IMedicalAccounts";
import { formatDate } from "../../utils/format";

interface MedicalAccountFacturasProps {
  facturas: IMedicalAccountFacturaApi[];
}

const handleDownload = (url: string) => {
  window.open(url, "_blank");
};

export function MedicalAccountFacturas({ facturas }: MedicalAccountFacturasProps) {
  if (facturas.length === 0) return null;

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <span className="text-xs font-semibold text-gray-600">Facturas</span>
        <span className="text-[11px] font-medium text-gray-400">{facturas.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                No. Factura
              </th>
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Fecha de carga
              </th>
              <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Archivos
              </th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => (
              <tr key={factura.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="font-medium text-gray-700">{factura.invoice_number}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-gray-500">{formatDate(factura.created_at)}</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(factura.pdf_url)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(factura.xml_url)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      <Download className="h-3 w-3" />
                      XML
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
