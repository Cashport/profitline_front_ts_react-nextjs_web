"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { Card } from "@/modules/chat/ui/card";
import { useDebounce } from "@/hooks/useDeabouce";
import { useDataExploration } from "@/modules/dataQuality/hooks/useDataExploration";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";
import { PERIODICITY_LABEL } from "@/modules/dataQuality/utils/periodicity";
import { TierSwatch, useTierFilter } from "@/modules/dataQuality/tiers";
import { useFileTypes } from "@/modules/dataQuality/hooks/useFileTypes";

/** The matrix shows one data type at a time (Sell Out or Stock), never both added up. */
const MATRIX_TYPE_PATTERN = /sell\s*-?\s*out|stock/i;
import {
  DAY_NUMBERS,
  MATRIX_LEGEND as LEGEND,
  MatrixRowCells,
  UnitType,
  buildMatrixRow,
  lastDataDayIndex,
  todayCutoffFor
} from "../matrix/MatrixRowCells";

const UNIT_OPTIONS: Array<{ key: "units_haleon" | "vol_reported"; label: string }> = [
  { key: "units_haleon", label: "Unidades" },
  { key: "vol_reported", label: "Volumen" }
];

const TOTAL_COLUMNS = 37;

export function DataExplorationCard() {
  const { selectedRegion, selectedPeriod, selectedFileType, setSelectedFileType, search } =
    useDataQualityDashboardContext();
  const { data: fileTypesData } = useFileTypes();
  const typeOptions = useMemo(() => {
    const all = fileTypesData ?? [];
    // Prefer exactly "Sell Out" and "Stock"; variants (All, Cedi, In-transit) only as fallback.
    const main = all.filter((t) => /^\s*(sell\s*-?\s*out|stock)\s*$/i.test(t.description));
    const matrixTypes = main.length
      ? main
      : all.filter((t) => MATRIX_TYPE_PATTERN.test(t.description));
    return (matrixTypes.length ? matrixTypes : all).map((t) => ({
      id: String(t.id),
      label: t.description
    }));
  }, [fileTypesData]);
  const defaultTypeId =
    typeOptions.find((t) => /sell/i.test(t.label))?.id ?? typeOptions[0]?.id ?? "";
  const activeTypeId = typeOptions.some((t) => t.id === selectedFileType)
    ? selectedFileType
    : defaultTypeId;
  const selectedTiers = useTierFilter((s) => s.selected);
  const [unitType, setUnitType] = useState<UnitType>("units_haleon");
  const debouncedSearch = useDebounce(search, 400);

  const { data, error, isLoading } = useDataExploration({
    id_country: selectedRegion || undefined,
    month: selectedPeriod,
    id_type_archive: activeTypeId || undefined,
    search: debouncedSearch || undefined,
    tiers: selectedTiers
  });

  const dayNumbers = DAY_NUMBERS;
  const { rows, lastDataDayIdx } = useMemo(() => {
    const computedRows = (data?.clients ?? []).map((client) => buildMatrixRow(client, unitType));
    return { rows: computedRows, lastDataDayIdx: lastDataDayIndex(computedRows) };
  }, [data, unitType]);

  const todayDayCutoff = useMemo(() => todayCutoffFor(selectedPeriod), [selectedPeriod]);

  return (
    <Card className="cp-card !p-0 rounded-[var(--card-radius)] border-0 bg-cp-surface shadow-none overflow-hidden">
      {/* Title line: name + legend on the left, metric switch on the right */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-[18px] pb-2 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-[#4a4a4a]">
            {LEGEND.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="h-2.5 w-2.5 rounded-[3px] border"
                  style={{ background: item.bg, borderColor: item.border }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {typeOptions.length > 0 && (
            <div
              role="radiogroup"
              aria-label="Tipo de archivo"
              className="flex h-9 items-center gap-0.5 rounded-lg bg-[#f7f7f7] p-[3px]"
            >
              {typeOptions.map((option) => {
                const on = activeTypeId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSelectedFileType(option.id)}
                    className="h-full whitespace-nowrap rounded-md px-3.5 text-[13px] transition-colors"
                    style={{
                      background: on ? "#cbe71e" : "transparent",
                      color: on ? "#141414" : "#6b6b6b",
                      fontWeight: on ? 600 : 500
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex h-9 items-center gap-0.5 rounded-lg bg-[#f7f7f7] p-[3px]">
            {UNIT_OPTIONS.map((option) => {
              const on = unitType === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setUnitType(option.key)}
                  className="h-full rounded-md px-3.5 text-[13px] transition-colors"
                  style={{
                    background: on ? "#ffffff" : "transparent",
                    color: on ? "#141414" : "#6b6b6b",
                    fontWeight: on ? 600 : 500,
                    boxShadow: on ? "0 1px 2px rgba(0,0,0,.06)" : "none"
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pr-[18px]">
        <table className="w-full" style={{ fontSize: "13px" }}>
          <thead>
            <tr className="border-b border-cp-line bg-cp-surface">
              <th
                className="text-left pl-[18px] pr-2 py-2 text-[13.5px] font-semibold text-cp-ink sticky left-0 bg-cp-surface z-10"
                style={{ minWidth: "156px" }}
              >
                Cliente
              </th>
              <th className="text-left px-2 py-2 text-[13.5px] font-semibold text-cp-ink">País</th>
              <th className="text-left px-2 py-2 text-[13.5px] font-semibold text-cp-ink">
                Periodicidad
              </th>
              {dayNumbers.map((d) => (
                <th
                  key={d}
                  className="text-center py-2 text-[13.5px] font-semibold text-cp-ink"
                  style={{ minWidth: "24px", width: "24px" }}
                >
                  {d}
                </th>
              ))}
              <th
                className="text-right px-2 py-2 text-[13.5px] font-semibold text-cp-ink"
                style={{ minWidth: "50px" }}
              >
                Total
              </th>
              <th
                className="text-right px-2 py-2 text-[13.5px] font-semibold text-cp-ink"
                style={{ minWidth: "55px" }}
              >
                Novedades
              </th>
              <th
                className="text-right px-2 py-2 text-[13.5px] font-semibold text-cp-ink"
                style={{ minWidth: "70px" }}
              >
                Mes ant.
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-[13px]"
                  style={{ color: "#6B7280" }}
                >
                  Cargando…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-[13px]"
                  style={{ color: "#991B1B" }}
                >
                  Error al cargar los datos.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-[13px]"
                  style={{ color: "#6B7280" }}
                >
                  No se encontraron datos con los filtros actuales.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                return (
                  <tr
                    key={`${row.id_client}-${idx}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F3F4F6" }}
                  >
                    <td
                      className="pl-[18px] pr-2 py-1 font-medium sticky left-0 bg-white z-10"
                      style={{ color: "#111827" }}
                    >
                      <Link
                        href={`/data-quality/client/${row.id_client}`}
                        className="flex items-center gap-1.5 text-[#1677ff] hover:underline"
                        style={{ maxWidth: "140px" }}
                        title={row.client_name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {row.tier && (
                          <span title={row.tier.name} className="inline-flex">
                            <TierSwatch code={row.tier.code} />
                          </span>
                        )}
                        <span className="truncate">{row.client_name}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-[13px] text-[#4a4a4a]">
                      {row.country || "-"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1 text-[13px] text-[#4a4a4a]">
                      {row.periodicity
                        ? PERIODICITY_LABEL[row.periodicity] ?? row.periodicity
                        : "-"}
                    </td>
                    <MatrixRowCells
                      row={row}
                      unitType={unitType}
                      todayDayCutoff={todayDayCutoff}
                      lastDataDayIdx={lastDataDayIdx}
                    />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
