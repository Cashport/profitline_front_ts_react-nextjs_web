"use client";

import { memo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FileUp,
  MoreHorizontal,
  RefreshCw,
  Wrench,
  X
} from "lucide-react";
import { ItemType } from "antd/es/menu/interface";
import { LoadError, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import { cn } from "@/utils/utils";
import {
  IMedicalAccountDocumentApi,
  IMedicalAccountNoveltyApi,
  MedicalAccountDocumentStatusCode
} from "@/types/medicalAccounts/IMedicalAccounts";
import { formatDocumentType } from "../../utils/format";

interface MedicalAccountDocumentsProps {
  documents: IMedicalAccountDocumentApi[];
  novedades: IMedicalAccountNoveltyApi[];
}

// Best-available human label for a document row (the API has no display name).
const docLabel = (doc: IMedicalAccountDocumentApi): string =>
  doc.service_description ?? doc.invoice_number ?? `Documento ${doc.sequence}`;

// Opens a document's PDF in a new tab (mirrors the purchase-order viewer's download).
const handleDownloadFile = (url: string | null | undefined) => {
  if (url) window.open(url, "_blank");
};

// ── Per-document status badge ──────────────────────────────────────────────────
const DOC_STATUS_STYLES: Record<MedicalAccountDocumentStatusCode, string> = {
  COMPLETE: "text-emerald-600",
  NOVELTY: "text-amber-600",
  ILLEGIBLE: "text-red-600",
  PENDING_REVIEW: "text-gray-500",
  ERROR: "text-red-600"
};

function DocStatus({
  statusCode,
  statusName
}: {
  statusCode: MedicalAccountDocumentStatusCode;
  statusName: string;
}) {
  const Icon = statusCode === "COMPLETE" ? CheckCircle2 : AlertCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        DOC_STATUS_STYLES[statusCode] ?? "text-gray-500"
      )}
    >
      <Icon className="h-3 w-3" />
      {statusName}
    </span>
  );
}

// ── PDF preview panel (renders the document's generated PDF) ────────────────────
const PdfPanel = memo(function PdfPanel({ doc }: { doc: IMedicalAccountDocumentApi }) {
  const label = docLabel(doc);
  const fileUrl = doc.generated_file_url;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const renderError = (error: LoadError) => {
    const message =
      error.name === "InvalidPDFException"
        ? "El documento es inválido o está corrupto."
        : error.name === "MissingPDFException"
          ? "No se encontró el documento."
          : error.name === "UnexpectedResponseException"
            ? "Respuesta inesperada del servidor."
            : "No se pudo cargar el documento.";

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <FileText className="h-12 w-12 text-gray-200" />
        <div>
          <p className="text-sm font-medium text-gray-500">Vista previa no disponible</p>
          <p className="mt-1 text-xs text-gray-400">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => handleDownloadFile(fileUrl)}
          disabled={!fileUrl}
          className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="truncate text-sm font-semibold text-gray-700">{label}</span>
          <span className="shrink-0 text-[11px] text-gray-400">
            — pág. {doc.page_start}–{doc.page_end}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleDownloadFile(fileUrl)}
          disabled={!fileUrl}
          className="ml-3 flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Descargar"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-100">
        {fileUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
            <div style={{ height: 520 }}>
              <Viewer
                fileUrl={fileUrl}
                plugins={[defaultLayoutPluginInstance]}
                renderError={renderError}
              />
            </div>
          </Worker>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <FileText className="h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Documento no disponible</p>
            <p className="text-xs text-gray-300">
              El PDF de este documento aún no está disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Row action menu ─────────────────────────────────────────────────────────────
// "Descargar" opens the document's PDF in a new tab; the rest are placeholders.
const buildRowMenuItems = (doc: IMedicalAccountDocumentApi): ItemType[] => [
  {
    key: "download",
    label: "Descargar",
    icon: <Download className="h-3.5 w-3.5" />,
    disabled: !doc.generated_file_url,
    onClick: () => handleDownloadFile(doc.generated_file_url)
  },
  { key: "fix", label: "Solucionar novedades", icon: <Wrench className="h-3.5 w-3.5" /> },
  { key: "reupload", label: "Cargar nuevamente", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  { key: "replace", label: "Reemplazar soporte", icon: <FileUp className="h-3.5 w-3.5" /> }
];

const dotsButtonStyle: React.CSSProperties = {
  height: 28,
  width: 28,
  minWidth: 28,
  padding: 0,
  border: "none",
  boxShadow: "none",
  background: "transparent"
};

export function MedicalAccountDocuments({ documents, novedades }: MedicalAccountDocumentsProps) {
  const sortedDocs = [...documents].sort((a, b) => a.sequence - b.sequence);

  const [viewingDoc, setViewingDoc] = useState<IMedicalAccountDocumentApi | null>(
    () => sortedDocs[0] ?? null
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Per-document novelty count, from novedades linked via medical_account_document_id.
  const noveltyCountByDoc = novedades.reduce<Record<number, number>>((acc, novedad) => {
    if (novedad.medical_account_document_id != null) {
      acc[novedad.medical_account_document_id] =
        (acc[novedad.medical_account_document_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  const allIds = documents.map((doc) => doc.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id));

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="flex" style={{ minHeight: 520 }}>
      {/* Documents table — 50% */}
      <div className="w-1/2 min-w-0 overflow-x-auto border-r border-gray-200">
        <div className="flex min-h-[44px] items-center gap-3 border-b border-gray-100 px-5 py-3">
          {someSelected ? (
            <>
              <span className="text-xs font-semibold text-gray-700">
                {selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-cashport-black px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar PDF{selectedIds.size > 1 ? "s" : ""}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold text-gray-600">Documentos clasificados</span>
              <span className="text-[11px] font-medium text-gray-400">{documents.length}</span>
            </>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <FileText className="mx-auto mb-2 h-7 w-7 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Sin documentos clasificados</p>
            <p className="mt-0.5 text-xs text-gray-300">Este archivo aún no ha sido procesado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-cashport-black"
                  />
                </th>
                <th className="w-36 px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Tipo
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Archivo
                </th>
                <th className="w-32 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Estado
                </th>
                <th className="w-24 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Novedades
                </th>
                <th className="w-12 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {sortedDocs.map((doc) => {
                const isViewing = viewingDoc?.id === doc.id;
                const isSelected = selectedIds.has(doc.id);
                const novedadesCount = noveltyCountByDoc[doc.id] ?? 0;
                return (
                  <tr
                    key={doc.id}
                    className={cn(
                      "border-b border-gray-50 transition-colors",
                      isSelected
                        ? "bg-gray-50"
                        : isViewing
                          ? "bg-blue-50/40"
                          : "hover:bg-gray-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(doc.id)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-cashport-black"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-sm text-gray-700">
                        {formatDocumentType(doc.document_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">{docLabel(doc)}</span>
                      <p className="mt-0.5 font-mono text-[11px] text-gray-400">
                        pág. {doc.page_start}–{doc.page_end}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <DocStatus statusCode={doc.status_code} statusName={doc.status_name} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          novedadesCount > 0 ? "text-amber-600" : "text-gray-400"
                        )}
                      >
                        {novedadesCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <DotsDropdown
                          items={buildRowMenuItems(doc)}
                          customButtonStyle={dotsButtonStyle}
                          customIcon={<MoreHorizontal className="h-4 w-4 text-gray-400" />}
                        />
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className={cn(
                            "rounded-md p-1.5 transition-colors",
                            isViewing
                              ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          )}
                          title={isViewing ? "Cerrar" : "Ver documento"}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {documents.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <FileUp className="h-3.5 w-3.5" />
              Cargar soporte
            </button>
          </div>
        )}
      </div>

      {/* PDF preview — 50% */}
      <div className="flex w-1/2 shrink-0 flex-col" style={{ minHeight: 520 }}>
        {viewingDoc ? (
          <PdfPanel doc={viewingDoc} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-gray-50 px-6 text-center">
            <FileText className="h-8 w-8 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Ningún documento seleccionado</p>
            <p className="text-xs text-gray-300">
              Haz clic en el ojo de un documento para verlo aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
