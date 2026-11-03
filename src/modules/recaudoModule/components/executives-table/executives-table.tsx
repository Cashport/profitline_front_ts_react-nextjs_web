"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Select } from "antd";

import PanelCard from "@/components/ui/panel-card/panel-card";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ICollectionTower, ITowerSeries } from "@/types/collectionTower/ICollectionTower";
import {
  AGREEMENT_COMPLIANCE_OK,
  AGREEMENT_COMPLIANCE_WARN,
  GROUPING_BY_ID,
  TONE_TEXT
} from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { useProgressiveRows } from "../../hooks/use-progressive-rows";
import type { Grouping } from "../../types";
import { withAlpha } from "../../utils/chart";
import { dimensionPatch, indexCatalogs, isDimensionSelected } from "../../utils/filters";
import { money, pct, sem } from "../../utils/format";
import { ExecutiveRow, executiveRows, executiveTotal, nextSort, sortRows } from "../../utils/rows";
import { FORECAST, FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
import GoalBar from "../shared/goal-bar";
import SentinelRow from "../shared/sentinel-row";
import { LegendItem, Swatch } from "../shared/legend";
import {
  AMOUNT,
  EMPTY,
  NAME,
  NO_GOAL,
  PERSON,
  ROW_CLICK,
  ROW_SELECTED,
  SUB,
  TABLE,
  TD,
  TD_TOTAL,
  THEAD
} from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/** Agrupaciones del selector, con ejecutivo primero (la vista por defecto de esta tabla). */
const GROUPING_OPTIONS: Grouping[] = ["executive", "client", "channel", "coordinator"];

/** Columnas ordenables (mismas llaves que el `sort_by` del Excel). */
const COLUMNS: {
  col: string;
  label: string;
  align?: "right";
  width: string;
  /** Dirección del primer clic. */
  dir: SortState["dir"];
}[] = [
  { col: "name", label: "", width: "w-[19%]", dir: "asc" },
  { col: "progress", label: "Avance", width: "w-[21%] pl-[18px]", dir: "desc" },
  { col: "collected", label: "Recaudo", align: "right", width: "w-[10%]", dir: "desc" },
  { col: "goal", label: "Meta", align: "right", width: "w-[10%]", dir: "desc" },
  { col: "diff", label: "Dif. vs meta", align: "right", width: "w-[10%]", dir: "asc" },
  { col: "pending", label: "Acuerdos", align: "right", width: "w-[10%]", dir: "desc" },
  { col: "forecast", label: "Forecast", align: "right", width: "w-[10%]", dir: "desc" },
  { col: "agreementsCompliance", label: "% Cumpl.", align: "right", width: "w-[10%]", dir: "asc" }
];

/** Valor de cada columna para ordenar; sin acuerdos vencidos, el % va al final. */
const sortValue = (r: ExecutiveRow, col: string): string | number => {
  if (col === "name") return r.name;
  if (col === "collected") return r.collected;
  if (col === "goal") return r.goal;
  if (col === "diff") return r.collected - r.goal;
  if (col === "pending") return r.pending;
  if (col === "forecast") return r.forecast;
  if (col === "agreementsCompliance") return r.overdueAgreed ? r.overduePaid / r.overdueAgreed : -1;
  return r.goal ? r.forecast / r.goal : 0;
};

interface ExecutiveRowViewProps {
  r: ExecutiveRow;
  isTotal?: boolean;
  /** Agrupado por cliente: el nombre va en mayúsculas, como en las demás tablas. */
  byClient: boolean;
  selected?: boolean;
  /** Mes abierto: se dibuja el forecast. */
  open: boolean;
  collected: ITowerSeries;
  pendingAgreements: ITowerSeries;
  /** Color de "cumplido" para el tooltip del % de cumplimiento. */
  fulfilled?: string;
  onSelect?: (row: ExecutiveRow) => void;
}

/** Una fila (o la de total). memo: al cambiar la selección sólo se repintan la fila que entra y la que sale. */
const ExecutiveRowView = memo(function ExecutiveRowView({
  r,
  isTotal = false,
  byClient,
  selected = false,
  open,
  collected,
  pendingAgreements,
  fulfilled,
  onSelect
}: ExecutiveRowViewProps) {
  const td = isTotal ? TD_TOTAL : TD;
  const compliance = r.goal ? r.collected / r.goal : 0;
  const forecastRatio = r.goal ? r.forecast / r.goal : 0;
  const agreementsCompliance = r.overdueAgreed ? r.overduePaid / r.overdueAgreed : NaN;
  const chip = (
    <StatusChip
      className="rounded tabular-nums"
      sev={
        agreementsCompliance >= AGREEMENT_COMPLIANCE_OK
          ? "ok"
          : agreementsCompliance >= AGREEMENT_COMPLIANCE_WARN
            ? "warn"
            : "crit"
      }
    >
      {pct(agreementsCompliance, 0)}
    </StatusChip>
  );

  return (
    <tr
      className={isTotal ? undefined : cn(ROW_CLICK, selected && ROW_SELECTED)}
      onClick={isTotal || !onSelect ? undefined : () => onSelect(r)}
    >
      <td className={td}>
        {isTotal ? (
          "Total"
        ) : (
          <>
            <span className={byClient ? NAME : PERSON}>{r.name}</span>
            <span className={SUB}>{r.sub}</span>
          </>
        )}
      </td>
      <td className={cn(td, "pl-[18px]")}>
        {/* Sin meta la barra no tiene contra qué medirse: salía llena y con 0 %. */}
        {r.goal > 0 ? (
          <TowerTooltip
            title={r.name}
            rows={[
              {
                key: "rec",
                color: collected.color,
                label: "Recaudado",
                value: `${money(r.collected)} · ${pct(compliance, 0)}`
              },
              {
                key: "pen",
                color: pendingAgreements.color,
                label: "Acuerdos vigentes",
                value: money(r.pending)
              },
              {
                key: "fc",
                color: withAlpha(FORECAST, 0.16),
                label: "Forecast",
                value: `${money(r.forecast)} · ${pct(forecastRatio, 0)}`
              },
              { key: "meta", color: FOREGROUND, label: "Meta", value: money(r.goal) }
            ]}
          >
            <div className="flex max-w-[260px] flex-col gap-[5px]">
              <GoalBar
                height={7}
                goalOverhang={4}
                scale={Math.max(r.goal, r.collected + r.pending, r.forecast) * 1.04 || 1}
                segments={[
                  { key: "rec", value: r.collected, color: collected.color },
                  { key: "pen", value: r.pending, color: pendingAgreements.color }
                ]}
                forecast={
                  open && r.forecast > r.collected
                    ? { from: r.collected, to: r.forecast, color: FORECAST }
                    : null
                }
                goal={{ value: r.goal }}
              />
              <div className="flex justify-between text-[13px] font-normal tabular-nums text-muted-foreground">
                <b className="font-bold">{pct(compliance, 0)} cumplido</b>
                <span>
                  →{" "}
                  <b className={cn("font-bold", TONE_TEXT[sem(forecastRatio)])}>
                    {pct(forecastRatio, 0)}
                  </b>
                </span>
              </div>
            </div>
          </TowerTooltip>
        ) : (
          <span className={NO_GOAL}>Sin meta</span>
        )}
      </td>
      <td className={cn(td, "text-right")}>
        <span className={AMOUNT}>{money(r.collected)}</span>
      </td>
      <td className={cn(td, "text-right")}>
        <span className={AMOUNT}>{money(r.goal)}</span>
      </td>
      <td className={cn(td, "text-right")}>
        <span className={cn(AMOUNT, TONE_TEXT[r.collected < r.goal ? "crit" : "ok"])}>
          {money(r.collected - r.goal, true)}
        </span>
      </td>
      <td className={cn(td, "text-right")}>
        <span className={AMOUNT}>{r.pending ? money(r.pending) : "—"}</span>
      </td>
      <td className={cn(td, "text-right")}>
        <TowerTooltip
          title="Forecast"
          rows={[
            { key: "rec", color: collected.color, label: "Recaudado", value: money(r.collected) },
            {
              key: "pen",
              color: pendingAgreements.color,
              label: "Acuerdos vigentes",
              value: money(r.pending)
            },
            {
              key: "dif",
              color: FOREGROUND,
              label: "Frente a la meta",
              value: money(r.forecast - r.goal, true)
            }
          ]}
        >
          <span className={AMOUNT}>{money(r.forecast)}</span>
        </TowerTooltip>
      </td>
      <td className={cn(td, "text-right")}>
        {!isFinite(agreementsCompliance) ? (
          <span className="text-[13px] font-normal text-muted-foreground">—</span>
        ) : isTotal ? (
          chip
        ) : (
          <TowerTooltip
            title="Cumplimiento de acuerdos"
            rows={[
              {
                key: "pag",
                color: fulfilled,
                label: "Pagado de lo vencido",
                value: pct(agreementsCompliance)
              },
              { key: "n", label: "Acuerdos vencidos", value: String(r.overdueCount) }
            ]}
          >
            <span>{chip}</span>
          </TowerTooltip>
        )}
      </td>
    </tr>
  );
});

/**
 * "Ejecutivos frente a su meta" (o clientes, canales, coordinadores): avance
 * con recaudado, acuerdos vigentes, forecast y meta; cumplimiento de acuerdos.
 * Alto máximo ≈ 650 px con scroll interno; encabezado y total fijos.
 */
export default function ExecutivesTable({ data }: { data: ICollectionTower }) {
  const { filters, patch } = useTowerFilters();
  const [by, setBy] = useState<Grouping>("executive");
  // Por defecto, de mayor a menor forecast frente a la meta.
  const [sort, setSort] = useState<SortState>({ col: "progress", dir: "desc" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const ix = indexCatalogs(data.catalogs);
  const grouping = GROUPING_BY_ID[by];
  const rows = useMemo(
    () => sortRows(executiveRows(data.clients, by, ix), sort, sortValue),
    [data.clients, by, ix, sort]
  );
  const total = useMemo(() => executiveTotal(data.clients), [data.clients]);
  const { visible, hasMore, sentinelRef } = useProgressiveRows(rows, scrollRef);
  const select = useCallback(
    (r: ExecutiveRow) => patch((f) => dimensionPatch(f, by, r, ix)),
    [patch, by, ix]
  );
  const open = data.period.open;
  const { collected, pendingAgreements } = data.summary.series;
  const fulfilled = data.agreementStatuses.find((s) => s.key === "FULFILLED")?.color;
  const rowProps = { byClient: by === "client", open, collected, pendingAgreements, fulfilled };

  return (
    <PanelCard
      title={`${grouping.plural} frente a su meta`}
      hint="clic para filtrar"
      flush
      actions={
        <>
          <Select
            size="small"
            aria-label="Ver por"
            className="w-[136px]"
            popupMatchSelectWidth={false}
            value={by}
            options={GROUPING_OPTIONS.map((id) => ({ value: id, label: GROUPING_BY_ID[id].label }))}
            onChange={setBy}
          />
          <ExcelButton
            table="executives"
            state={{ groupBy: by, sortBy: sort.col, sortDir: sort.dir }}
            name={`${grouping.plural} frente a su meta`}
            periodLabel={data.period.label}
          />
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[13px] text-foreground/80">
        <LegendItem mark={<Swatch color={collected.color} />} label="Recaudado" />
        <LegendItem mark={<Swatch color={pendingAgreements.color} />} label="Acuerdos vigentes" />
        <LegendItem mark={<Swatch color={FORECAST} outline />} label="Forecast" />
        <LegendItem
          mark={<i className="inline-block h-2 w-[3px] shrink-0 rounded-[1px] bg-foreground" />}
          label="Meta"
        />
      </div>
      {rows.length ? (
        <div
          ref={scrollRef}
          className="scrollbar-thin max-h-[min(653px,calc((100vh_-_150px)_*_0.8))] overflow-auto border-t border-border"
        >
          <table className={cn(TABLE, "min-w-[880px]")}>
            <thead className={THEAD}>
              <tr>
                {COLUMNS.map((c) => (
                  <SortableTh
                    key={c.col}
                    col={c.col}
                    label={c.col === "name" ? grouping.singular : c.label}
                    align={c.align}
                    sort={sort}
                    onSort={(col) => setSort((s) => nextSort(s, col, c.dir))}
                    className={c.width}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <ExecutiveRowView
                  key={r.id}
                  {...rowProps}
                  r={r}
                  selected={isDimensionSelected(filters, by, r)}
                  onSelect={select}
                />
              ))}
              {hasMore && <SentinelRow ref={sentinelRef} colSpan={COLUMNS.length} />}
              <ExecutiveRowView {...rowProps} r={total} isTotal />
            </tbody>
          </table>
        </div>
      ) : (
        <div className={cn(EMPTY, "border-t border-border")}>Sin datos para esta selección</div>
      )}
    </PanelCard>
  );
}
