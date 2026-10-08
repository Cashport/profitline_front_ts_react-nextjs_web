"use client";

import { useState } from "react";
import { Select } from "antd";

import PanelCard from "@/components/ui/panel-card/panel-card";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import {
  AGREEMENT_COMPLIANCE_OK,
  AGREEMENT_COMPLIANCE_WARN,
  GROUPING_BY_ID,
  TONE_TEXT
} from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import type { Grouping } from "../../types";
import { withAlpha } from "../../utils/chart";
import { dimensionPatch, indexCatalogs, isDimensionSelected } from "../../utils/filters";
import { money, pct, sem } from "../../utils/format";
import { ExecutiveRow, executiveRows, executiveTotal } from "../../utils/rows";
import { FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
import GoalBar from "../shared/goal-bar";
import { LegendItem, Swatch } from "../shared/legend";
import {
  AMOUNT,
  EMPTY,
  NAME,
  PERSON,
  ROW_CLICK,
  ROW_SELECTED,
  SUB,
  TABLE,
  TD,
  TD_TOTAL,
  TH,
  THEAD
} from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/** Agrupaciones del selector, con ejecutivo primero (la vista por defecto de esta tabla). */
const GROUPING_OPTIONS: Grouping[] = ["executive", "client", "channel", "coordinator"];

/**
 * "Ejecutivos frente a su meta" (o clientes, canales, coordinadores): avance
 * con recaudado, acuerdos vigentes, forecast y meta; cumplimiento de acuerdos.
 * Alto máximo ≈ 650 px con scroll interno; encabezado y total fijos.
 */
export default function ExecutivesTable({ data }: { data: ICollectionTower }) {
  const { filters, patch } = useTowerFilters();
  const [by, setBy] = useState<Grouping>("executive");
  const ix = indexCatalogs(data.catalogs);
  const grouping = GROUPING_BY_ID[by];
  const rows = executiveRows(data.clients, by, ix);
  const total = executiveTotal(data.clients);
  const open = data.period.open;
  const { collected, pendingAgreements } = data.summary.series;
  const fulfilled = data.agreementStatuses.find((s) => s.key === "FULFILLED")?.color;

  // Función y no componente: un componente declarado aquí se remontaría en cada render.
  const renderRow = (r: ExecutiveRow, isTotal = false) => {
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
        key={isTotal ? "total" : r.id}
        className={
          isTotal ? undefined : cn(ROW_CLICK, isDimensionSelected(filters, by, r) && ROW_SELECTED)
        }
        onClick={isTotal ? undefined : () => patch((f) => dimensionPatch(f, by, r, ix))}
      >
        <td className={td}>
          {isTotal ? (
            "Total"
          ) : (
            <>
              <span className={by === "client" ? NAME : PERSON}>{r.name}</span>
              <span className={SUB}>{r.sub}</span>
            </>
          )}
        </td>
        <td className={cn(td, "pl-[18px]")}>
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
                color: withAlpha(collected.color, 0.16),
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
                    ? { from: r.collected, to: r.forecast, color: collected.color }
                    : null
                }
                goal={{ value: r.goal }}
              />
              <div className="flex justify-between text-[10.5px] font-normal tabular-nums text-muted-foreground">
                <b className="font-bold">{pct(compliance, 0)} cumplido</b>
                <span>
                  →{" "}
                  <b className={cn("font-bold", TONE_TEXT[sem(forecastRatio)])}>{pct(forecastRatio, 0)}</b>
                </span>
              </div>
            </div>
          </TowerTooltip>
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
            <span className="text-[10.5px] font-normal text-muted-foreground">—</span>
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
  };

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
            state={{ groupBy: by }}
            name={`${grouping.plural} frente a su meta`}
            periodLabel={data.period.label}
          />
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[10.5px] text-foreground/80">
        <LegendItem mark={<Swatch color={collected.color} />} label="Recaudado" />
        <LegendItem mark={<Swatch color={pendingAgreements.color} />} label="Acuerdos vigentes" />
        <LegendItem mark={<Swatch color={collected.color} outline />} label="Forecast" />
        <LegendItem
          mark={<i className="inline-block h-2 w-[3px] shrink-0 rounded-[1px] bg-foreground" />}
          label="Meta"
        />
      </div>
      {rows.length ? (
        <div className="scrollbar-thin h-[min(653px,calc((100vh_-_150px)_*_0.8))] min-h-[300px] overflow-auto border-t border-border">
          <table className={cn(TABLE, "min-w-[880px]")}>
            <thead className={THEAD}>
              <tr>
                <th className={cn(TH, "w-[19%]")}>{grouping.singular}</th>
                <th className={cn(TH, "w-[21%] pl-[18px]")}>Avance</th>
                <th className={cn(TH, "w-[10%] text-right")}>Recaudo</th>
                <th className={cn(TH, "w-[10%] text-right")}>Meta</th>
                <th className={cn(TH, "w-[10%] text-right")}>Dif. vs meta</th>
                <th className={cn(TH, "w-[10%] text-right")}>Acuerdos</th>
                <th className={cn(TH, "w-[10%] text-right")}>Forecast</th>
                <th className={cn(TH, "w-[10%] text-right")} title="Cumplimiento de acuerdos de pago">
                  % Cumpl.
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => renderRow(r))}
              {renderRow(total, true)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={cn(EMPTY, "border-t border-border")}>Sin datos para esta selección</div>
      )}
    </PanelCard>
  );
}
