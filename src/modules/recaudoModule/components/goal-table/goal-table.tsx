"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Select } from "antd";

import PanelCard from "@/components/ui/panel-card/panel-card";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { AVANCE_SCALE, GROUPINGS, GROUPING_BY_ID, TONE_TEXT } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { useProgressiveRows } from "../../hooks/use-progressive-rows";
import type { Grouping, Tone } from "../../types";
import { withAlpha } from "../../utils/chart";
import { dimensionPatch, indexCatalogs, isDimensionSelected } from "../../utils/filters";
import { full, money, pct, sem } from "../../utils/format";
import { GoalRow, goalRows, nextSort, paceRatio, sortRows, sumBy } from "../../utils/rows";
import { FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
import GoalBar from "../shared/goal-bar";
import SentinelRow from "../shared/sentinel-row";
import {
  AMOUNT,
  EMPTY,
  HIDE_SM,
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

const diffTone = (diff: number) => TONE_TEXT[diff < 0 ? "crit" : "ok"];

interface AvanceProps {
  collected: number;
  goal: number;
  forecast: number;
  pace: number;
  color: string;
}

/** Barra hasta el 130% de la meta: recaudado, forecast punteado y marca de meta. */
function Avance({ collected, goal, forecast, pace, color }: AvanceProps) {
  // Sin meta la barra salía llena (escala 0) y con 0 %.
  if (goal <= 0) return <span className={NO_GOAL}>Sin meta</span>;
  const c = collected / goal;
  const f = forecast / goal;
  // Tono del recaudado: contra el ritmo esperado al día de corte, no contra la meta del mes.
  const q = paceRatio(c, pace);
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

interface GoalTableRowProps {
  row: GoalRow;
  selected: boolean;
  color: string;
  onSelect: (row: GoalRow) => void;
}

/** Una fila de la tabla. memo: al cambiar la selección sólo se repintan la fila que entra y la que sale. */
const GoalTableRow = memo(function GoalTableRow({
  row: r,
  selected,
  color,
  onSelect
}: GoalTableRowProps) {
  return (
    <tr className={cn(ROW_CLICK, selected && ROW_SELECTED)} onClick={() => onSelect(r)}>
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
  );
});

/**
 * "Clientes frente a su meta" (o ejecutivos, canales, coordinadores): recaudo,
 * meta, diferencia, avance y forecast. Clic en una fila filtra el tablero.
 */
export default function GoalTable({ data }: { data: ICollectionTower }) {
  const { filters, patch } = useTowerFilters();
  const [by, setBy] = useState<Grouping>("client");
  const [sort, setSort] = useState<SortState>({ col: "diff", dir: "asc" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const ix = indexCatalogs(data.catalogs);
  const color = data.summary.series.collected.color;
  const grouping = GROUPING_BY_ID[by];
  const rows = useMemo(
    () =>
      sortRows(
        goalRows(data.clients, by, ix),
        sort,
        (r, col) => r[col as keyof GoalRow] as string | number
      ),
    [data.clients, by, ix, sort]
  );
  const { visible, hasMore, sentinelRef } = useProgressiveRows(rows, scrollRef);
  const select = useCallback(
    (r: GoalRow) => patch((f) => dimensionPatch(f, by, r, ix)),
    [patch, by, ix]
  );

  const { onPace, withGoal, tCollected, tGoal, tForecast, tPace } = useMemo(() => {
    const goal = sumBy(rows, (r) => r.goal);
    // Sólo las filas con meta: las de meta 0 (y ritmo 0) contaban siempre como "al ritmo".
    const measurable = rows.filter((r) => r.goal > 0);
    return {
      onPace: measurable.filter((r) => paceRatio(r.compliance, r.pace) >= 1).length,
      withGoal: measurable.length,
      tCollected: sumBy(rows, (r) => r.collected),
      tGoal: goal,
      tForecast: sumBy(rows, (r) => r.forecast),
      tPace: goal ? sumBy(rows, (r) => r.pace * r.goal) / goal : 1
    };
  }, [rows]);

  return (
    <PanelCard
      title={`${grouping.plural} frente a su meta`}
      hint={`${onPace} de ${withGoal} con meta van al ritmo`}
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
        <div ref={scrollRef} className="scrollbar-thin absolute inset-0 overflow-y-auto">
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
                visible.map((r) => (
                  <GoalTableRow
                    key={r.id}
                    row={r}
                    selected={isDimensionSelected(filters, by, r)}
                    color={color}
                    onSelect={select}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} className={EMPTY}>
                    Sin clientes
                  </td>
                </tr>
              )}
              {hasMore && <SentinelRow ref={sentinelRef} colSpan={COLUMNS.length} />}
              {rows.length > 0 && (
                <tr>
                  <td className={TD_TOTAL}>Total</td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>{money(tCollected)}</td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums", HIDE_SM)}>
                    {money(tGoal)}
                  </td>
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>
                    <span className={diffTone(tCollected - tGoal)}>
                      {money(tCollected - tGoal, true)}
                    </span>
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
