"use client";

import { memo } from "react";
import { Download, FileText } from "lucide-react";
import { LoadError, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import { IMedicalAccountDocumentApi } from "@/types/medicalAccounts/IMedicalAccounts";

interface PdfPanelProps {
  doc: IMedicalAccountDocumentApi;
  label: string;
  onDownload: (url: string | null | undefined) => void;
}

const PdfPanel = memo(function PdfPanel({ doc, label, onDownload }: PdfPanelProps) {
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
          onClick={() => onDownload(fileUrl)}
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
          onClick={() => onDownload(fileUrl)}
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

export { PdfPanel };
