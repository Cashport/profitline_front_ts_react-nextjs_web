"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Wrench,
  X
} from "lucide-react";
import { ItemType } from "antd/es/menu/interface";

import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import { cn } from "@/utils/utils";
import { IMedicalAccountDocument } from "../../types/IMedicalAccount";
import { DOC_GROUPS } from "../../constants";

interface MedicalAccountDocumentsProps {
  documents: IMedicalAccountDocument[];
}

// ── Per-document status badge ──────────────────────────────────────────────────
function DocStatus({ novedades }: { novedades: number }) {
  if (novedades > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <AlertCircle className="h-3 w-3" />
        Novedad
        <span className="ml-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-600">
          {novedades}
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
      <CheckCircle2 className="h-3 w-3" />
      Completo
    </span>
  );
}

// ── PDF preview panel (placeholder — no real rendering yet) ─────────────────────
function PdfPanel({ doc }: { doc: IMedicalAccountDocument }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalPages = doc.endPage - doc.startPage + 1;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [doc.id]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="truncate text-sm font-semibold text-gray-700">{doc.name}</span>
          <span className="shrink-0 text-[11px] text-gray-400">
            — pág. {doc.startPage}–{doc.endPage}
          </span>
        </div>
        <button
          type="button"
          className="ml-3 flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          title="Descargar"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-100 px-4 py-4">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2">
            <span className="truncate text-xs font-medium text-gray-500">{doc.name}</span>
            <span className="ml-2 shrink-0 font-mono text-[11px] text-gray-400">
              {totalPages} {totalPages === 1 ? "página" : "páginas"}
            </span>
          </div>
          <div className="flex flex-1 select-none flex-col items-center justify-center gap-2">
            <FileText className="h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">{doc.name}</p>
            <p className="text-xs text-gray-300">
              Páginas {doc.startPage}–{doc.endPage} del archivo original
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Row action menu (mock items) ───────────────────────────────────────────────
const rowMenuItems: ItemType[] = [
  { key: "download", label: "Descargar", icon: <Download className="h-3.5 w-3.5" /> },
  { key: "fix", label: "Solucionar novedades", icon: <Wrench className="h-3.5 w-3.5" /> },
  { key: "reupload", label: "Cargar nuevamente", icon: <RefreshCw className="h-3.5 w-3.5" /> }
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

export function MedicalAccountDocuments({ documents }: MedicalAccountDocumentsProps) {
  const [viewingDoc, setViewingDoc] = useState<IMedicalAccountDocument | null>(
    documents.length > 0 ? documents[0] : null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const orderedRows = DOC_GROUPS.flatMap((group) =>
    documents.filter((doc) => doc.type === group.type).map((doc) => ({ doc, group }))
  );

  const allIds = documents.map((doc) => doc.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id));

  const toggleSelect = (id: string) => {
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
              {orderedRows.map(({ doc, group }) => {
                const isViewing = viewingDoc?.id === doc.id;
                const isSelected = selectedIds.has(doc.id);
                const novedadesCount = doc.novedadesCount ?? 0;
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
                    <td className="px-0 py-3">
                      <div className="flex items-center">
                        <div className={cn("mr-4 h-8 w-0.5 shrink-0 rounded-r-full", group.accent)} />
                        <span className="text-sm text-gray-700">{group.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      <p className="mt-0.5 font-mono text-[11px] text-gray-400">
                        pág. {doc.startPage}–{doc.endPage}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <DocStatus novedades={novedadesCount} />
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
                          items={rowMenuItems}
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
