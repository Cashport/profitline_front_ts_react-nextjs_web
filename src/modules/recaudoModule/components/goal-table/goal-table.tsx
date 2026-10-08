"use client";

import { useState } from "react";
import { Select } from "antd";

import PanelCard from "@/components/ui/panel-card/panel-card";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { AVANCE_SCALE, GROUPINGS, GROUPING_BY_ID, TONE_TEXT } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import type { Grouping, Tone } from "../../types";
import { withAlpha } from "../../utils/chart";
import { dimensionPatch, indexCatalogs, isDimensionSelected } from "../../utils/filters";
import { full, money, pct, sem } from "../../utils/format";
import { GoalRow, goalRows, nextSort, sortRows, sumBy } from "../../utils/rows";
import { FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
import GoalBar from "../shared/goal-bar";
import {
  AMOUNT,
  EMPTY,
  HIDE_SM,
  NAME,
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

const COLUMNS: {
  col: keyof GoalRow;
  label: string;
  align?: "right";
  width: string;
  hideSm?: boolean;
  /** Dirección del primer clic. */
  dir: SortState["dir"];
}[] = [
  { col: "name", label: "", width: "w-[30%]", dir: "asc" },
  { col: "collected", label: "Recaudo", align: "right", width: "w-[14%]", dir: "desc" },
  { col: "goal", label: "Meta", align: "right", width: "w-[14%]", hideSm: true, dir: "desc" },
  { col: "diff", label: "Dif.", align: "right", width: "w-[14%]", dir: "asc" },
  { col: "compliance", label: "Avance", width: "w-[14%]", dir: "asc" },
  { col: "forecast", label: "Forecast", align: "right", width: "w-[14%]", dir: "desc" }
];

interface AvanceProps {
  collected: number;
  goal: number;
  forecast: number;
  pace: number;
  color: string;
}

/** Barra hasta el 130% de la meta: recaudado, forecast punteado y marca de meta. */
function Avance({ collected, goal, forecast, pace, color }: AvanceProps) {
  const c = goal ? collected / goal : 0;
  const f = goal ? forecast / goal : 0;
  // Tono del recaudado: contra el ritmo esperado al día de corte, no contra la meta del mes.
  const q = pace ? c / pace : 0;
  const tone: Tone = q >= 1 ? "ok" : q >= 0.9 ? "warn" : "crit";
  const scale = goal * AVANCE_SCALE;
  const shown = Math.min(collected, scale);

  return (
    <TowerTooltip
      title="Avance vs meta"
      rows={[
        { key: "rec", color, label: "Recaudado", value: `${money(collected)} · ${pct(c, 0)}` },
        {
          key: "fc",
          color: withAlpha(color, 0.16),
          label: "Forecast",
          value: `${money(forecast)} · ${pct(f, 0)}`
        },
        { key: "meta", color: FOREGROUND, label: "Meta", value: money(goal) }
      ]}
    >
      <div className="flex min-w-0 max-w-[84px] flex-col gap-[5px]">
        <GoalBar
          height={5}
          goalOverhang={3}
          dashWidth={1}
          scale={scale}
          segments={[{ key: "rec", value: shown, color }]}
          forecast={{ from: shown, to: Math.min(forecast, scale), color }}
          goal={{ value: goal }}
        />
        <div className="flex justify-between text-[10.5px] tabular-nums text-muted-foreground">
          <b className={cn("font-bold", TONE_TEXT[tone])}>{pct(c, 0)}</b>
          <span>
            → <b className={cn("font-bold", TONE_TEXT[sem(f)])}>{pct(f, 0)}</b>
          </span>
        </div>
      </div>
    </TowerTooltip>
  );
}

/**
 * "Clientes frente a su meta" (o ejecutivos, canales, coordinadores): recaudo,
 * meta, diferencia, avance y forecast. Clic en una fila filtra el tablero.
 */
export default function GoalTable({ data }: { data: ICollectionTower }) {
  const { filters, patch } = useTowerFilters();
  const [by, setBy] = useState<Grouping>("client");
  const [sort, setSort] = useState<SortState>({ col: "diff", dir: "asc" });
  const ix = indexCatalogs(data.catalogs);
  const color = data.summary.series.collected.color;
  const grouping = GROUPING_BY_ID[by];
  const rows = sortRows(goalRows(data.clients, by, ix), sort, (r, col) => r[col as keyof GoalRow] as string | number);
  const onPace = rows.filter((r) => r.compliance >= r.pace).length;

  const tCollected = sumBy(rows, (r) => r.collected);
  const tGoal = sumBy(rows, (r) => r.goal);
  const tForecast = sumBy(rows, (r) => r.forecast);
  const tPace = tGoal ? sumBy(rows, (r) => r.pace * r.goal) / tGoal : 1;
  const diffTone = (diff: number) => TONE_TEXT[diff < 0 ? "crit" : "ok"];

  return (
    <PanelCard
      title={`${grouping.plural} frente a su meta`}
      hint={`${onPace} de ${rows.length} van al ritmo`}
      flush
      actions={
        <>
          <Select
            size="small"
            aria-label="Ver meta por"
            className="w-[136px]"
            popupMatchSelectWidth={false}
            value={by}
            options={GROUPINGS.map((g) => ({ value: g.id, label: g.label }))}
            onChange={setBy}
          />
          <ExcelButton
            table="goals"
            state={{ groupBy: by, sortBy: sort.col, sortDir: sort.dir }}
            name={`${grouping.plural} frente a su meta`}
            periodLabel={data.period.label}
          />
        </>
      }
    >
      <div className="relative min-h-[360px] flex-1">
        <div className="scrollbar-thin absolute inset-0 overflow-y-auto">
          <table className={TABLE}>
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
                    className={cn(c.width, c.hideSm && HIDE_SM)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(ROW_CLICK, isDimensionSelected(filters, by, r) && ROW_SELECTED)}
                    onClick={() => patch((f) => dimensionPatch(f, by, r, ix))}
                  >
                    <td className={TD}>
                      <span className={r.person ? PERSON : NAME}>{r.name}</span>
                      <span className={SUB}>{r.sub}</span>
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <TowerTooltip
                        title="Recaudo"
                        rows={[{ key: "v", color, label: "Valor", value: full(r.collected) }]}
                      >
                        <span className={AMOUNT}>{money(r.collected)}</span>
                      </TowerTooltip>
                    </td>
                    <td className={cn(TD, "text-right", HIDE_SM)}>
                      <span className={AMOUNT}>{money(r.goal)}</span>
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <span className={cn(AMOUNT, diffTone(r.diff))}>{money(r.diff, true)}</span>
                    </td>
                    <td className={TD}>
                      <Avance
                        collected={r.collected}
                        goal={r.goal}
                        forecast={r.forecast}
                        pace={r.pace}
                        color={color}
                      />
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <TowerTooltip
                        title="Forecast"
                        rows={[
                          { key: "rec", color, label: "Recaudado", value: money(r.collected) },
                          {
                            key: "in",
                            color: withAlpha(color, 0.16),
                            label: "Por entrar",
                            value: money(r.forecast - r.collected)
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} className={EMPTY}>
                    Sin clientes
                  </td>
                </tr>
              )}
              {rows.length > 0 && (
                <tr>
                  <td className={TD_TOTAL}>Total</td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>{money(tCollected)}</td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums", HIDE_SM)}>{money(tGoal)}</td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>
                    <span className={diffTone(tCollected - tGoal)}>{money(tCollected - tGoal, true)}</span>
                  </td>
                  <td className={TD_TOTAL}>
                    <Avance
                      collected={tCollected}
                      goal={tGoal}
                      forecast={tForecast}
                      pace={tPace}
                      color={color}
                    />
                  </td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>{money(tForecast)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PanelCard>
  );
}
