"use client";

import { useState } from "react";
import { Select } from "antd";

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
import type { AgreementView } from "../../types";
import { withAlpha } from "../../utils/chart";
import { indexCatalogs } from "../../utils/filters";
import { fecha, fechaCorta, full, money, plural } from "../../utils/format";
import { agreementRows, clientName, clientSub, nextSort, sumBy } from "../../utils/rows";
import { FOREGROUND } from "../shared/chart-styles";
import ExcelButton from "../shared/excel-button";
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

const COLUMNS: {
  col: string;
  label: string;
  align?: "right";
  width: string;
  hideSm?: boolean;
  dir: SortState["dir"];
}[] = [
  { col: "client", label: "Cliente", width: "w-[42%]", dir: "asc" },
  { col: "dueDate", label: "Fecha", width: "w-[15%]", hideSm: true, dir: "asc" },
  { col: "days", label: "Atraso", width: "w-[13%]", dir: "desc" },
  { col: "balance", label: "Saldo", align: "right", width: "w-[14%]", dir: "desc" },
  { col: "status", label: "Estado", width: "w-[16%]", dir: "asc" }
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
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded px-[7px] py-px text-[10.5px] font-semibold text-foreground"
      style={{ background: withAlpha(status.color, 0.18) }}
    >
      <i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: status.color }} />
      {status.label}
    </span>
  );
}

/** Atraso de un incumplido, días para vencer de un pendiente o "a tiempo". */
function DaysCell({ a }: { a: ITowerAgreement }) {
  if (a.lateDays) {
    return (
      <StatusChip sev={a.lateDays > LATE_DAYS_CRIT ? "crit" : "warn"} className="rounded tabular-nums">
        {plural(a.lateDays, "día", "días")}
      </StatusChip>
    );
  }
  if (a.status === "PENDING") {
    return (
      <StatusChip sev="idle" className="rounded tabular-nums">
        {a.daysToDue <= 0 ? "vence hoy" : `vence en ${a.daysToDue} d`}
      </StatusChip>
    );
  }
  return <span className="text-[10.5px] text-muted-foreground">a tiempo</span>;
}

/**
 * "Detalle de acuerdos". Por defecto, incumplidos y luego pendientes, por
 * monto. Con segmentos elegidos en el gráfico muestra sólo esos.
 */
export default function AgreementsTable({ data }: { data: ICollectionTower }) {
  const { filters, patch, toggleClient } = useTowerFilters();
  const [view, setView] = useState<AgreementView>("all");
  const [sort, setSort] = useState<SortState | null>(null);
  const ix = indexCatalogs(data.catalogs);
  const statuses = new Map(data.agreementStatuses.map((s) => [s.key, s]));
  const bySegments = filters.segments.length > 0;
  const list = agreementRows(data.agreements, view, bySegments, sort, ix);
  const balance = sumBy(list, (a) => a.balance);
  // El saldo va en rojo si ya venció sin pagarse completo.
  const overdue = (a: ITowerAgreement) => a.balance > 0 && a.status !== "PENDING";

  const changeView = (next: AgreementView) => {
    setView(next);
    setSort(null);
    patch({ segments: [] });
  };

  return (
    <PanelCard
      title="Detalle de acuerdos"
      hint={plural(list.length, "acuerdo", "acuerdos")}
      flush
      actions={
        <>
          <Select
            size="small"
            aria-label="Ver acuerdos"
            className="w-[140px]"
            popupMatchSelectWidth={false}
            value={view}
            options={AGREEMENT_VIEWS.map((v) => ({ value: v.id, label: v.label }))}
            onChange={changeView}
          />
          <ExcelButton
            table="agreements"
            state={{ view: bySegments ? undefined : view, sortBy: sort?.col, sortDir: sort?.dir }}
            name="Detalle de acuerdos"
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
                    label={c.label}
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
                list.map((a) => {
                  const name = clientName(ix, a.clientId);
                  return (
                    <tr
                      key={a.id}
                      className={cn(ROW_CLICK, filters.search === name && ROW_SELECTED)}
                      onClick={() => toggleClient(name)}
                    >
                      <td className={TD}>
                        <span className={NAME}>{name}</span>
                        <span className={SUB}>{clientSub(ix, a.clientId)}</span>
                      </td>
                      <td className={cn(TD, HIDE_SM)}>
                        <span className="block tabular-nums">{fecha(a.dueDate)}</span>
                        <span className={SUB}>
                          cargado {fechaCorta(a.loadedAt)}
                          {a.reschedules ? ` · reprog. ×${a.reschedules}` : ""}
                        </span>
                      </td>
                      <td className={TD}>
                        <DaysCell a={a} />
                      </td>
                      <td className={cn(TD, "text-right")}>
                        <TowerTooltip
                          title="Acuerdo"
                          rows={[
                            { key: "a", color: FOREGROUND, label: "Acordado", value: full(a.agreed) },
                            {
                              key: "p",
                              color: statuses.get("FULFILLED")?.color,
                              label: "Pagado",
                              value: full(a.paid)
                            },
                            {
                              key: "s",
                              color: statuses.get("BROKEN")?.color,
                              label: "Saldo",
                              value: full(a.balance)
                            }
                          ]}
                        >
                          <span className="inline-block">
                            <span className={cn(AMOUNT, "block", overdue(a) && TONE_TEXT.crit)}>
                              {money(a.balance)}
                            </span>
                            <span className={SUB}>de {money(a.agreed)}</span>
                          </span>
                        </TowerTooltip>
                      </td>
                      <td className={TD}>
                        <StateChip status={statuses.get(a.status)} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} className={EMPTY}>
                    Nada en esta vista para la selección actual
                  </td>
                </tr>
              )}
              {list.length > 0 && (
                <tr>
                  <td className={TD_TOTAL}>Total</td>
                  <td className={cn(TD_TOTAL, HIDE_SM)}>{plural(list.length, "acuerdo", "acuerdos")}</td>
                  <td className={TD_TOTAL} />
                  <td className={cn(TD_TOTAL, "text-right tabular-nums")}>
                    <span className={cn(list.some(overdue) && TONE_TEXT.crit)}>{money(balance)}</span>
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
