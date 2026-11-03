"use client";

import { memo, useMemo, useRef, useState } from "react";
import { Select } from "antd";
import { useTranslations } from "use-intl";

import PanelCard from "@/components/ui/panel-card/panel-card";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type {
  ICollectionTower,
  ITowerAgreement,
  ITowerSeries
} from "@/types/collectionTower/ICollectionTower";
import { AGREEMENT_VIEWS, LATE_DAYS_CRIT, TONE_TEXT } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { useProgressiveRows } from "../../hooks/use-progressive-rows";
import type { AgreementView } from "../../types";
import { withAlpha } from "../../utils/chart";
import { CatalogIndex, indexCatalogs } from "../../utils/filters";
import { fecha, fechaCorta, full, money } from "../../utils/format";
import { agreementRows, clientName, clientSub, nextSort, sumBy } from "../../utils/rows";
import { FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
import SentinelRow from "../shared/sentinel-row";
import {
  AMOUNT,
  EMPTY,
  HIDE_SM,
  NAME,
  ROW_CLICK,
  ROW_SELECTED,
  SUB,
  TABLE,
  TD,
  TD_TOTAL,
  THEAD
} from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/** Nombre de cada columna: `collections.agreementsTable.columns.<col>`. */
const COLUMNS: {
  col: "client" | "dueDate" | "days" | "balance" | "status";
  align?: "right";
  width: string;
  hideSm?: boolean;
  dir: SortState["dir"];
}[] = [
  { col: "client", width: "w-[42%]", dir: "asc" },
  { col: "dueDate", width: "w-[15%]", hideSm: true, dir: "asc" },
  { col: "days", width: "w-[13%]", dir: "desc" },
  { col: "balance", align: "right", width: "w-[14%]", dir: "desc" },
  { col: "status", width: "w-[16%]", dir: "asc" }
];

/** Sin orden elegido: la lista va en el orden de la vista. */
const NO_SORT: SortState = { col: "", dir: "desc" };

/**
 * Estado del acuerdo: fondo tenue y punto del color del API, texto del tema
 * (un mismo color para los dos temas no garantiza contraste como texto).
 */
function StateChip({ status }: { status?: ITowerSeries }) {
  if (!status) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded px-[7px] py-px text-[13px] font-semibold text-foreground"
      style={{ background: withAlpha(status.color, 0.18) }}
    >
      <i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: status.color }} />
      {status.label}
    </span>
  );
}

/** Atraso de un incumplido, días para vencer de un pendiente o "a tiempo". */
function DaysCell({ a }: { a: ITowerAgreement }) {
  const tc = useTranslations("collections.agreementsTable");
  if (a.lateDays) {
    return (
      <StatusChip
        sev={a.lateDays > LATE_DAYS_CRIT ? "crit" : "warn"}
        className="rounded tabular-nums"
      >
        {tc("days", { count: a.lateDays })}
      </StatusChip>
    );
  }
  if (a.status === "PENDING") {
    return (
      <StatusChip sev="idle" className="rounded tabular-nums">
        {a.daysToDue <= 0 ? tc("dueToday") : tc("dueIn", { days: a.daysToDue })}
      </StatusChip>
    );
  }
  return <span className="text-[13px] text-muted-foreground">{tc("onTime")}</span>;
}

// El saldo va en rojo si ya venció sin pagarse completo.
const overdue = (a: ITowerAgreement) => a.balance > 0 && a.status !== "PENDING";

interface AgreementRowProps {
  a: ITowerAgreement;
  ix: CatalogIndex;
  statuses: Map<string, ITowerSeries>;
  selected: boolean;
  onToggle: (clientId: string) => void;
}

/** Una fila del detalle. memo: al cambiar la selección sólo se repintan la fila que entra y la que sale. */
const AgreementRow = memo(function AgreementRow({
  a,
  ix,
  statuses,
  selected,
  onToggle
}: AgreementRowProps) {
  const tc = useTranslations("collections.agreementsTable");
  return (
    <tr className={cn(ROW_CLICK, selected && ROW_SELECTED)} onClick={() => onToggle(a.clientId)}>
      <td className={TD}>
        <span className={NAME}>{clientName(ix, a.clientId)}</span>
        <span className={SUB}>{clientSub(ix, a.clientId)}</span>
      </td>
      <td className={cn(TD, HIDE_SM)}>
        <span className="block tabular-nums">{fecha(a.dueDate)}</span>
        <span className={SUB}>
          {tc("loaded", { date: fechaCorta(a.loadedAt) })}
          {a.reschedules ? ` · ${tc("rescheduled", { count: a.reschedules })}` : ""}
        </span>
      </td>
      <td className={TD}>
        <DaysCell a={a} />
      </td>
      <td className={cn(TD, "text-right")}>
        <TowerTooltip
          title={tc("agreementTitle")}
          rows={[
            { key: "a", color: FOREGROUND, label: tc("agreed"), value: full(a.agreed) },
            {
              key: "p",
              color: statuses.get("FULFILLED")?.color,
              label: tc("paid"),
              value: full(a.paid)
            },
            {
              key: "s",
              color: statuses.get("BROKEN")?.color,
              label: tc("balance"),
              value: full(a.balance)
            }
          ]}
        >
          <span className="inline-block">
            <span className={cn(AMOUNT, "block", overdue(a) && TONE_TEXT.crit)}>
              {money(a.balance)}
            </span>
            <span className={SUB}>{tc("ofAgreed", { amount: money(a.agreed) })}</span>
          </span>
        </TowerTooltip>
      </td>
      <td className={TD}>
        <StateChip status={statuses.get(a.status)} />
      </td>
    </tr>
  );
});

/**
 * "Detalle de acuerdos". Por defecto, incumplidos y luego pendientes, por
 * monto. Con segmentos elegidos en el gráfico muestra sólo esos.
 */
export default function AgreementsTable({ data }: { data: ICollectionTower }) {
  const tc = useTranslations("collections");
  const tCommon = useTranslations("common");
  const { filters, patch, toggleClient } = useTowerFilters();
  const [view, setView] = useState<AgreementView>("all");
  const [sort, setSort] = useState<SortState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ix = indexCatalogs(data.catalogs);
  const statuses = useMemo(
    () => new Map<string, ITowerSeries>(data.agreementStatuses.map((s) => [s.key, s])),
    [data.agreementStatuses]
  );
  const bySegments = filters.segments.length > 0;
  const list = useMemo(
    () => agreementRows(data.agreements, view, bySegments, sort, ix),
    [data.agreements, view, bySegments, sort, ix]
  );
  const { visible, hasMore, sentinelRef } = useProgressiveRows(list, scrollRef);
  const balance = useMemo(() => sumBy(list, (a) => a.balance), [list]);

  const changeView = (next: AgreementView) => {
    setView(next);
    setSort(null);
    patch({ segments: [] });
  };

  return (
    <PanelCard
      title={tc("agreementsTable.title")}
      hint={tc("agreementsTable.count", { count: list.length })}
      flush
      actions={
        <>
          <Select
            size="small"
            aria-label={tc("agreementsTable.viewAria")}
            className="w-[140px]"
            popupMatchSelectWidth={false}
            value={view}
            options={AGREEMENT_VIEWS.map((v) => ({ value: v, label: tc(`agreementViews.${v}`) }))}
            onChange={changeView}
          />
          <ExcelButton
            table="agreements"
            state={{ view: bySegments ? undefined : view, sortBy: sort?.col, sortDir: sort?.dir }}
            name={tc("agreementsTable.title")}
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
                    label={
                      c.col === "client"
                        ? tCommon("fields.customer")
                        : c.col === "status"
                          ? tCommon("fields.status")
                          : tc(`agreementsTable.columns.${c.col}`)
                    }
                    align={c.align}
                    sort={sort ?? NO_SORT}
                    onSort={(col) => setSort((s) => nextSort(s, col, c.dir))}
                    className={cn(c.width, c.hideSm && HIDE_SM)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                visible.map((a) => (
                  <AgreementRow
                    key={a.id}
                    a={a}
                    ix={ix}
                    statuses={statuses}
                    selected={filters.client === a.clientId}
                    onToggle={toggleClient}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} className={EMPTY}>
                    {tc("agreementsTable.empty")}
                  </td>
                </tr>
              )}
              {hasMore && <SentinelRow ref={sentinelRef} colSpan={COLUMNS.length} />}
              {list.length > 0 && (
                <tr>
                  <td className={TD_TOTAL}>{tc("rows.total")}</td>
                  <td className={cn(TD_TOTAL, HIDE_SM)}>
                    {tc("agreementsTable.count", { count: list.length })}
                  </td>
                  <td className={TD_TOTAL} />
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>
                    <span className={cn(list.some(overdue) && TONE_TEXT.crit)}>
                      {money(balance)}
                    </span>
                  </td>
                  <td className={TD_TOTAL} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PanelCard>
  );
}
