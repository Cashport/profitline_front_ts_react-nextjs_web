"use client";

import React, { useState } from "react";
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { useTranslations } from "use-intl";

interface UsadosTableProps {
  data?: any[];
  onDevolucionClick?: (id: string) => void;
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export const UsadosTable: React.FC<UsadosTableProps> = ({
  data = [],
  onDevolucionClick,
  onSort,
  sortField,
  sortOrder
}) => {
  const t = useTranslations("seals.tables");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([]);
    else setSelectedIds(data.map((item) => item.Id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderSortIcon = (field: string) => (
    <SortArrows dir={sortField === field ? (sortOrder === "ASC" ? "asc" : "desc") : null} />
  );

  return (
    <div className="w-full min-w-0">
      <div className="min-w-0">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="select-none">
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-10 text-[13.5px] font-semibold text-cp-ink">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-cp-line-2 accent-[#cbe71e] w-4 h-4 cursor-pointer"
                />
              </th>

              {/* 👇 COLUMNA ORDENABLE: PRECINTO 👇 */}
              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("IdPrecinto")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("seal")}
                  {renderSortIcon("IdPrecinto")}
                </span>
              </th>

              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">
                {t("to")}
              </th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">
                {t("quantity")}
              </th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">
                {t("returnId")}
              </th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">
                {t("customer")}
              </th>

              {/* 👇 COLUMNA ORDENABLE: FECHA DE USO 👇 */}
              <th
                className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink"
                onClick={() => onSort && onSort("FechaRegistro")}
              >
                <span className="inline-flex items-center gap-1">
                  {t("usedOn")}
                  {renderSortIcon("FechaRegistro")}
                </span>
              </th>

              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">
                {t("usedBy")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-muted text-cp-ink">
            {data.map((item) => {
              const isSelected = selectedIds.includes(item.Id);
              return (
                <tr
                  key={item.Id}
                  className={`hover:bg-cp-subtle transition-colors ${isSelected ? "bg-cp-subtle" : ""}`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(item.Id)}
                      className="rounded border-cp-line-2 accent-[#cbe71e] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-cp-ink">{item.IdPrecinto}</td>
                  <td className="py-3 px-4 font-semibold text-cp-ink">
                    {item.IdPrecintoHasta || ""}
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink">{item.Cantidad || 1}</td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onDevolucionClick && onDevolucionClick(item.IdDevolucion)}
                      className="text-cp-blue hover:text-cp-blue-hover font-semibold cursor-pointer"
                      title={item.IdDevolucion}
                    >
                      {item.IdDevolucion
                        ? `${item.IdDevolucion.substring(0, 15)}...`
                        : t("noReturn")}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink text-[13px]">
                    {item.ClienteNombre || t("customerUnavailable")}
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink-2">
                    {item.FechaUso
                      ? new Date(item.FechaUso).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                      : item.FechaRegistro
                        ? new Date(item.FechaRegistro).toLocaleDateString("es-CO")
                        : "-"}
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink">
                    {item.UsuarioAsignoNombre || t("noName")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
