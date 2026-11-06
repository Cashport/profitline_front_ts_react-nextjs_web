"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useDataExploration } from "@/modules/dataQuality/hooks/useDataExploration";
import { buildLastSixMonths } from "@/modules/dataQuality/utils/months";
import { PERIODICITY_LABEL } from "@/modules/dataQuality/utils/periodicity";
import { IClientDetailDataArchive } from "@/types/dataQuality/IDataQuality";
import {
  DAY_NUMBERS,
  MATRIX_LEGEND,
  MatrixRowCells,
  UnitType,
  buildMatrixRow,
  lastDataDayIndex,
  todayCutoffFor
} from "../Dashboard/matrix/MatrixRowCells";

const UNIT_OPTIONS: Array<{ key: UnitType; label: string }> = [
  { key: "units_haleon", label: "Unidades" },
  { key: "vol_reported", label: "Volumen" }
];

interface ClientMonthMatrixProps {
  clientId: number;
  countryId?: number | null;
  /** Client file rules: one matrix row per configured data type. */
  intakes: IClientDetailDataArchive[];
}

interface TypeRowProps {
  clientId: number;
  intake: IClientDetailDataArchive;
  month: string;
  unitType: UnitType;
}

/** One data type of the client for the month: same cells as the "Exploración de unidades" matrix. */
function TypeRow({ clientId, intake, month, unitType }: TypeRowProps) {
  const { data, isLoading } = useDataExploration({
    month,
    id_type_archive: intake.id_type_archive,
    id_client: clientId
  });
  const client = data?.clients.find((c) => c.id_client === clientId);
  const row = client ? buildMatrixRow(client, unitType) : null;
  const typeName = intake.data_type?.description || intake.tipo_archivo;

  return (
    <tr className="border-b border-[#f2f2f2] transition-colors hover:bg-gray-50">
      <td className="sticky left-0 z-10 bg-white py-1 pl-[18px] pr-2">
        <span className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-[#141414]">
          {intake.data_type?.abreviation && (
            <span
              className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
              style={{ backgroundColor: intake.data_type.color }}
            >
              {intake.data_type.abreviation}
            </span>
          )}
          {typeName}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-1 text-[13px] text-[#4a4a4a]">
        {intake.periodicity ? PERIODICITY_LABEL[intake.periodicity] ?? intake.periodicity : "-"}
      </td>
      {row ? (
        <MatrixRowCells
          row={row}
          unitType={unitType}
          todayDayCutoff={todayCutoffFor(month)}
          lastDataDayIdx={lastDataDayIndex([row])}
        />
      ) : (
        <td
          colSpan={DAY_NUMBERS.length + 3}
          className="py-2 text-center text-[13px] text-[#8a8a8a]"
        >
          {isLoading ? "Cargando…" : "Sin datos para este mes"}
        </td>
      )}
    </tr>
  );
}

/** Current month ingestion of one client, one row per data type it receives. */
export function ClientMonthMatrix({ clientId, intakes }: ClientMonthMatrixProps) {
  const periods = useMemo(buildLastSixMonths, []);
  const [periodIdx, setPeriodIdx] = useState(0);
  const [unitType, setUnitType] = useState<UnitType>("units_haleon");
  const month = periods[periodIdx].id;

  // One row per data type, even if the client has several rules of the same type.
  const types = useMemo(() => {
    const seen = new Set<number>();
    return intakes.filter((intake) => {
      if (seen.has(intake.id_type_archive)) return false;
      seen.add(intake.id_type_archive);
      return true;
    });
  }, [intakes]);

  const navBtn =
    "flex h-7 w-7 items-center justify-center rounded-md text-[#8a8a8a] transition-colors hover:bg-white hover:text-[#141414] disabled:cursor-default disabled:text-[#d6d6d6] disabled:hover:bg-transparent";

  return (
    <section className="cp-card overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-[18px] pb-2 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
          <h2 className="whitespace-nowrap text-[18px] font-semibold text-[#141414]">
            Ingesta del mes
          </h2>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-[#4a4a4a]">
            {MATRIX_LEGEND.map((item) => (
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
          <div className="flex h-9 items-center gap-0.5 rounded-lg bg-[#f7f7f7] px-1">
            <button
              type="button"
              aria-label="Mes anterior"
              className={navBtn}
              disabled={periodIdx >= periods.length - 1}
              onClick={() => setPeriodIdx((i) => i + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[112px] text-center text-[13px] font-medium text-[#4a4a4a]">
              {periods[periodIdx].name}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              className={navBtn}
              disabled={periodIdx === 0}
              onClick={() => setPeriodIdx((i) => i - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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

      <div className="overflow-x-auto pb-3 pr-[18px]">
        <table className="w-full" style={{ fontSize: "13px" }}>
          <thead>
            <tr className="border-b border-cp-line bg-cp-surface">
              <th
                className="sticky left-0 z-10 bg-cp-surface py-2 pl-[18px] pr-2 text-left text-[13.5px] font-semibold text-cp-ink"
                style={{ minWidth: "150px" }}
              >
                Tipo de archivo
              </th>
              <th className="px-2 py-2 text-left text-[13.5px] font-semibold text-cp-ink">
                Periodicidad
              </th>
              {DAY_NUMBERS.map((d) => (
                <th
                  key={d}
                  className="py-2 text-center text-[13.5px] font-semibold text-cp-ink"
                  style={{ minWidth: "24px", width: "24px" }}
                >
                  {d}
                </th>
              ))}
              <th className="px-2 py-2 text-right text-[13.5px] font-semibold text-cp-ink">
                Total
              </th>
              <th className="px-2 py-2 text-right text-[13.5px] font-semibold text-cp-ink">
                Novedades
              </th>
              <th className="px-2 py-2 text-right text-[13.5px] font-semibold text-cp-ink">
                Mes ant.
              </th>
            </tr>
          </thead>
          <tbody>
            {types.length === 0 ? (
              <tr>
                <td
                  colSpan={DAY_NUMBERS.length + 5}
                  className="py-6 text-center text-[13px] text-[#8a8a8a]"
                >
                  El cliente no tiene tipos de archivo configurados.
                </td>
              </tr>
            ) : (
              types.map((intake) => (
                <TypeRow
                  key={intake.id_type_archive}
                  clientId={clientId}
                  intake={intake}
                  month={month}
                  unitType={unitType}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
