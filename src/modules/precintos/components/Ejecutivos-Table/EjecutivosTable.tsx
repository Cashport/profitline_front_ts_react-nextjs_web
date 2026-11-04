"use client";

import React from "react";
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { useTranslations } from "use-intl";

export interface IEjecutivoStats {
  EjecutivoId: string;
  EjecutivoNombre: string;
  UltimoEnvio: string;
  Recibidos: number;
  Usados: number;
  Anulados: number;
  PorcentajeUso: number;
  Asignados: number;
}

interface EjecutivosTableProps {
  data: IEjecutivoStats[];
  onVer?: (ejecutivo: IEjecutivoStats) => void;
  onMover?: (ejecutivo: IEjecutivoStats) => void;
  onSort?: (field: string) => void; // 👈 Asegúrate de que esté aquí
  sortField?: string; // 👈 Asegúrate de que esté aquí
  sortOrder?: "ASC" | "DESC"; // 👈 Asegúrate de que esté aquí
}

export const EjecutivosTable: React.FC<EjecutivosTableProps> = ({
  data = [],
  onVer,
  onMover,
  onSort,
  sortField,
  sortOrder
}) => {
  const t = useTranslations("seals.repsTable");
  const tCommon = useTranslations("common");

  // 👇 Función para pintar las flechitas
  const renderSortIcon = (field: string) => (
    <SortArrows dir={sortField === field ? (sortOrder === "ASC" ? "asc" : "desc") : null} />
  );

  return (
    <div className="w-full min-w-0">
      <div className="min-w-0">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="select-none">
              {/* 👇 COLUMNAS CON FLECHITAS 👇 */}
              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("EjecutivoNombre")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("rep")}
                  {renderSortIcon("EjecutivoNombre")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("UltimoEnvio")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("lastShipment")}
                  {renderSortIcon("UltimoEnvio")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("Recibidos")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("received")}
                  {renderSortIcon("Recibidos")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("Usados")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("used")}
                  {renderSortIcon("Usados")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("Anulados")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("voided")}
                  {renderSortIcon("Anulados")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("PorcentajeUso")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("usagePct")}
                  {renderSortIcon("PorcentajeUso")}
                </span>
              </th>

              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("Asignados")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("assigned")}
                  {renderSortIcon("Asignados")}
                </span>
              </th>

              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-right text-[13.5px] font-semibold text-cp-ink"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-muted text-cp-ink">
            {data.map((ejecutivo) => (
              <tr key={ejecutivo.EjecutivoId} className="hover:bg-cp-subtle transition-colors">
                <td className="py-3 px-4 font-semibold text-cp-ink">{ejecutivo.EjecutivoNombre}</td>
                <td className="py-3 px-4 font-medium text-cp-ink-2">
                  {ejecutivo.UltimoEnvio
                    ? new Date(ejecutivo.UltimoEnvio).toLocaleDateString("es-CO")
                    : "-"}
                </td>
                <td className="py-3 px-4 font-medium text-cp-ink">{ejecutivo.Recibidos}</td>
                <td className="py-3 px-4 font-medium text-cp-ink">{ejecutivo.Usados}</td>
                <td className="py-3 px-4 font-medium text-cp-magenta">{ejecutivo.Anulados}</td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1 bg-cp-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cp-lime"
                        style={{ width: `${Math.min(ejecutivo.PorcentajeUso, 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-cp-ink-2 text-[13px]">
                      {Math.round(ejecutivo.PorcentajeUso)}%
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 font-semibold text-cp-ink">{ejecutivo.Asignados}</td>

                <td className="py-3 px-4 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => onVer && onVer(ejecutivo)}
                    className="text-cp-blue hover:text-cp-blue-hover font-semibold cursor-pointer transition-colors"
                  >
                    {tCommon("actions.view")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onMover && onMover(ejecutivo)}
                    className="text-cp-blue hover:text-cp-blue-hover font-semibold cursor-pointer transition-colors"
                  >
                    {t("move")}
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-cp-ink-3 text-[13px]">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
