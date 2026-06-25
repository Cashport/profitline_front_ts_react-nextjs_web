"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";

import { IMedicalAccountDocument } from "../../types/IMedicalAccount";
import { DOCUMENT_TYPE_LABELS } from "../../constants";

interface MedicalAccountDocumentsProps {
  documents: IMedicalAccountDocument[];
}

export function MedicalAccountDocuments({ documents }: MedicalAccountDocumentsProps) {
  const [selectedDoc, setSelectedDoc] = useState<IMedicalAccountDocument | null>(null);

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-600">Documentos clasificados</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {documents.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Documents list */}
        <div className="flex-1">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm font-medium text-cashport-black">Sin documentos clasificados</p>
              <p className="text-xs text-gray-400">Este archivo aún no ha sido procesado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      isSelected ? "border-cashport-black bg-gray-50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <FileText size={20} className="shrink-0 text-red-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cashport-black">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {DOCUMENT_TYPE_LABELS[doc.type]} · Págs {doc.startPage}-{doc.endPage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                      aria-label={`Ver ${doc.name}`}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center">
          {selectedDoc ? (
            <>
              <FileText size={40} className="mb-3 text-red-400" />
              <p className="text-sm font-semibold text-cashport-black">{selectedDoc.name}</p>
              <p className="text-xs text-gray-400">
                {DOCUMENT_TYPE_LABELS[selectedDoc.type]} · Págs {selectedDoc.startPage}-
                {selectedDoc.endPage}
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Vista previa del PDF (pendiente de integración).
              </p>
            </>
          ) : (
            <>
              <FileText size={40} className="mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-cashport-black">
                Ningún documento seleccionado
              </p>
              <p className="text-xs text-gray-400">
                Haz clic en el ojo de un documento para verlo aquí.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
