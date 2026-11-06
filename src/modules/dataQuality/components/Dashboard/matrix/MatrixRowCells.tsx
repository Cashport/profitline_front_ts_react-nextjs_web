"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import { formatNumber } from "@/utils/utils";
import { formatThousandNum } from "@/modules/dataQuality/utils/utils";
import { IDataExplorationClient, IDataExplorationTotals } from "@/types/dataQuality/IDataQuality";
import type { IClientTier } from "@/modules/dataQuality/tiers/tiers";

export type UnitType = "units_haleon" | "vol_reported";
type DayCell = IDataExplorationTotals & { novedades_percent: number };

export const DAYS_IN_MONTH = 31;
export const DAY_NUMBERS = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);

export const MATRIX_LEGEND = [
  { label: "Recibido", bg: "#D1FAE5", border: "#D1FAE5" },
  { label: "Con novedades", bg: "#FEF3C7", border: "#FEF3C7" },
  { label: "Faltante", bg: "#FEE2E2", border: "#FEE2E2" },
  { label: "Esperado", bg: "#ffffff", border: "#E5E7EB" },
  { label: "No esperado", bg: "#F3F4F6", border: "#F3F4F6" }
];

/** Empty-day cells: red only when a date was generated and nothing arrived. */
const CELL_STYLE = {
  missing: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  expected: { backgroundColor: "#ffffff", color: "#9CA3AF" },
  "not-expected": { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
} as const;

export interface MatrixRow {
  id_client: number;
  client_name: string;
  country: string;
  country_client_id: number;
  periodicity: string | null;
  tier: IClientTier | null;
  expectedDays: Set<number> | null;
  days: Array<DayCell | null>;
  total: number;
  totalRegistros: number;
  totalNovedades: number;
  lastMonth: IDataExplorationClient["last_month"];
}

export const buildMatrixRow = (client: IDataExplorationClient, unitType: UnitType): MatrixRow => {
  const dayMap = new Map<number, DayCell>();
  for (const d of client.dates) {
    const dayNum = Number(d.date.slice(-2));
    if (!Number.isNaN(dayNum)) {
      dayMap.set(dayNum, { ...d.totals, novedades_percent: d.novedades_percent ?? 0 });
    }
  }
  return {
    id_client: client.id_client,
    client_name: client.client_name,
    country: client.dates[0]?.rows[0]?.country ?? "",
    country_client_id: client.country_client_id,
    periodicity: client.periodicity,
    tier: client.tier ?? null,
    expectedDays: client.expected_days ? new Set(client.expected_days) : null,
    days: DAY_NUMBERS.map((n) => dayMap.get(n) ?? null),
    total: client.totals[unitType],
    totalRegistros: client.totals.total_registros,
    totalNovedades: client.totals.novedades,
    lastMonth: client.last_month
  };
};

/** Last day index with data across rows (fallback when the API sends no expected days). */
export const lastDataDayIndex = (rows: MatrixRow[]) => {
  let last = -1;
  for (const row of rows) {
    for (let i = row.days.length - 1; i >= 0; i--) {
      if (row.days[i] !== null) {
        if (i > last) last = i;
        break;
      }
    }
  }
  return last;
};

/** Day of the month up to which days are in the past (Infinity for past months, 0 for future). */
export const todayCutoffFor = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return Infinity;
  if (year > currentYear || (year === currentYear && month > currentMonth)) return 0;
  return today.getDate();
};

interface MatrixRowCellsProps {
  row: MatrixRow;
  unitType: UnitType;
  todayDayCutoff: number;
  lastDataDayIdx: number;
}

/** Day cells + Total, Novedades and previous month cells of one matrix row. */
export function MatrixRowCells({
  row,
  unitType,
  todayDayCutoff,
  lastDataDayIdx
}: MatrixRowCellsProps) {
  const novedadesPct =
    row.totalRegistros > 0 ? Math.round((row.totalNovedades / row.totalRegistros) * 100) : 0;
  return (
    <>
      {row.days.map((dayTotals, dayIdx) => {
        const dayNumber = dayIdx + 1;
        const isFutureDay = dayNumber > todayDayCutoff;
        // A day is expected only when an archive date was generated for the client.
        const isExpected = row.expectedDays
          ? row.expectedDays.has(dayNumber)
          : dayIdx < lastDataDayIdx || isFutureDay;

        const emptyCell = () => {
          const state = !isExpected ? "not-expected" : isFutureDay ? "expected" : "missing";
          return (
            <td
              key={dayIdx}
              title={
                state === "missing"
                  ? "Faltante: se esperaba archivo este día"
                  : state === "expected"
                    ? "Esperado"
                    : "No esperado"
              }
              className="text-center py-1 font-medium tabular-nums"
              style={CELL_STYLE[state]}
            >
              {state === "missing" ? "-" : state === "expected" ? "⋯" : ""}
            </td>
          );
        };

        if (dayTotals === null) return emptyCell();

        if (dayTotals.novedades > 0) {
          const catalogHref = row.country_client_id
            ? `/data-quality/catalogs/${row.id_client}/${row.country_client_id}` +
              `?clientName=${encodeURIComponent(row.client_name)}` +
              `&countryName=${encodeURIComponent(row.country)}`
            : null;
          const cellContent = (
            <td
              key={dayIdx}
              className="text-center py-1 font-medium tabular-nums relative"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              {formatThousandNum(dayTotals[unitType])}
              <div
                className="absolute top-0 right-0 w-0 h-0"
                style={{
                  borderLeft: "6px solid transparent",
                  borderTop: "6px solid #F59E0B"
                }}
              />
            </td>
          );

          return (
            <TooltipProvider key={dayIdx} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[13px] px-2 py-1.5"
                  style={{ backgroundColor: "#1F2937", color: "#fff" }}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" style={{ color: "#FBBF24" }} />
                    <span>
                      {formatNumber(dayTotals.novedades)} novedades ({dayTotals.novedades_percent}%)
                    </span>
                    {catalogHref && (
                      <Link
                        href={catalogHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ir al catálogo del cliente"
                        className="ml-1 inline-flex hover:opacity-80"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#FBBF24" }} />
                      </Link>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        if (dayTotals[unitType] === 0) return emptyCell();

        return (
          <td
            key={dayIdx}
            className="text-center py-1 font-medium tabular-nums"
            style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
          >
            {formatThousandNum(dayTotals[unitType])}
          </td>
        );
      })}
      <td className="text-right px-2 py-1 font-semibold tabular-nums" style={{ color: "#111827" }}>
        {formatNumber(row.total)}
      </td>
      <td className="text-right px-2 py-1 tabular-nums">
        {row.totalNovedades > 0 ? (
          <div className="flex items-center justify-end gap-1">
            <span className="font-semibold" style={{ color: "#F59E0B" }}>
              {formatNumber(row.totalNovedades)}
            </span>
            <span
              className="text-[13px] px-1 py-0.5 rounded"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              {novedadesPct}%
            </span>
          </div>
        ) : (
          <span style={{ color: "#9CA3AF" }}>-</span>
        )}
      </td>
      {(() => {
        const lastMonth = row.lastMonth;

        if (lastMonth == null) {
          return (
            <td
              className="text-center px-2 py-1 font-semibold tabular-nums"
              style={{ backgroundColor: "#F9FAFB", color: "#9CA3AF" }}
            >
              ⋯
            </td>
          );
        }

        if (lastMonth[unitType] === 0 && lastMonth.novedades === 0) {
          return (
            <td
              className="text-center px-2 py-1 font-semibold tabular-nums"
              style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
            >
              -
            </td>
          );
        }

        if (lastMonth.novedades > 0) {
          const cellContent = (
            <td
              className="text-right px-2 py-1 font-semibold tabular-nums relative"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              {formatThousandNum(lastMonth[unitType])}
              <div
                className="absolute top-0 right-0 w-0 h-0"
                style={{
                  borderLeft: "6px solid transparent",
                  borderTop: "6px solid #F59E0B"
                }}
              />
            </td>
          );

          return (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-[13px] px-2 py-1.5"
                  style={{ backgroundColor: "#1F2937", color: "#fff" }}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" style={{ color: "#FBBF24" }} />
                    <span>
                      {formatNumber(lastMonth.novedades)} novedades ({lastMonth.novedades_percent}%)
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <td
            className="text-right px-2 py-1 font-semibold tabular-nums"
            style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
          >
            {formatThousandNum(lastMonth[unitType])}
          </td>
        );
      })()}
    </>
  );
}
