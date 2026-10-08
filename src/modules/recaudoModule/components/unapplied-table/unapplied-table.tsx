"use client";

import { useState } from "react";
import { Select } from "antd";
import { ExternalLink } from "lucide-react";

import PanelCard from "@/components/ui/panel-card/panel-card";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { PNA_AGES, PNA_DAYS_CRIT, PNA_DAYS_WARN } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import type { PnaAge } from "../../types";
import { indexCatalogs } from "../../utils/filters";
import { fmt, fmtPaidAt, full, money, plural } from "../../utils/format";
import {
  clientName,
  clientSub,
  nextSort,
  pendingDays,
  sumBy,
  unappliedRows
} from "../../utils/rows";
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
  { col: "id", label: "ID pago", width: "w-[14%]", dir: "asc" },
  { col: "client", label: "Cliente", width: "w-[34%]", dir: "asc" },
  { col: "paidAt", label: "Fecha de pago", width: "w-[18%]", hideSm: true, dir: "asc" },
  { col: "days", label: "Tiempo pendiente", align: "right", width: "w-[16%]", dir: "desc" },
  { col: "amount", label: "Monto pendiente", align: "right", width: "w-[18%]", dir: "desc" }
];

/** Tiempo pendiente: neutro hasta 3 días, alerta de 4 a 7, crítico con más de 7. */
const ageTone = (days: number) =>
  days > PNA_DAYS_CRIT ? "crit" : days > PNA_DAYS_WARN ? "warn" : "idle";

const payments = (n: number) => plural(n, "pago", "pagos");

/**
 * "Pagos identificados sin aplicar (PNA)": cada pago con su tiempo pendiente,
 * filtros rápidos por coordinador (selección múltiple) y por antigüedad.
 */
export default function UnappliedTable({ data }: { data: ICollectionTower }) {
  const { filters, toggleClient } = useTowerFilters();
  const [age, setAge] = useState<PnaAge>("all");
  const [coordinators, setCoordinators] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ col: "days", dir: "desc" });
  const ix = indexCatalogs(data.catalogs);
  const color = data.application.series.unapplied.color;
  const minDays = PNA_AGES.find((a) => a.id === age)?.minDays ?? null;
  const { rows, byCoordinator, active } = unappliedRows(
    data.unappliedPayments,
    minDays,
    coordinators,
    sort,
    ix
  );
  const total = sumBy(rows, (p) => p.amount);
  const avgDays = total ? sumBy(rows, (p) => (p.amount * p.pendingHours) / 24) / total : 0;

  const toggleCoordinator = (id: string) =>
    setCoordinators((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const hint = `${
    active.length ? `${plural(active.length, "coordinador filtrando", "coordinadores filtrando")} · ` : ""
  }${payments(rows.length)} · ${money(total)}`;

  return (
    <PanelCard
      title="Pagos identificados sin aplicar (PNA)"
      hint={hint}
      flush
      actions={
        <>
          <Select
            size="small"
            aria-label="Filtrar PNA"
            className="w-[136px]"
            popupMatchSelectWidth={false}
            value={age}
            options={PNA_AGES.map((a) => ({ value: a.id, label: a.label }))}
            onChange={setAge}
          />
          <ExcelButton
            table="unapplied"
            state={{ pnaAge: age, coordinators: active, sortBy: sort.col, sortDir: sort.dir }}
            name="PNA sin aplicar"
            periodLabel={data.period.label}
          />
        </>
      }
    >
      <div
        role="group"
        aria-label="Filtrar PNA por coordinador"
        className="flex flex-wrap gap-0.5 px-4 py-2.5"
      >
        {data.catalogs.coordinators
          .filter((c) => byCoordinator.has(c.id))
          .map((c) => {
            const own = byCoordinator.get(c.id) ?? [];
            const on = active.includes(c.id);
            return (
              <TowerTooltip
                key={c.id}
                title={c.name}
                rows={[
                  { key: "n", color, label: "Pagos sin aplicar", value: String(own.length) },
                  { key: "v", color, label: "Monto", value: money(sumBy(own, (p) => p.amount)) }
                ]}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCoordinator(c.id)}
                  className={cn(
                    "cursor-pointer rounded-md border border-transparent bg-transparent px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground",
                    on && "border-wallet-accent bg-wallet-accent-soft font-medium text-foreground"
                  )}
                >
                  {c.name}
                </button>
              </TowerTooltip>
            );
          })}
      </div>

      <div className="scrollbar-thin max-h-[min(560px,calc(100vh_-_150px))] overflow-y-auto border-t border-border">
        <table className={TABLE}>
          <thead className={THEAD}>
            <tr>
              {COLUMNS.map((c) => (
                <SortableTh
                  key={c.col}
                  col={c.col}
                  label={c.label}
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
              rows.map((p) => {
                const name = clientName(ix, p.clientId);
                const days = pendingDays(p);
                const paid = fmtPaidAt(p.paidAt);
                return (
                  <tr
                    key={`${p.id}-${p.paidAt}`}
                    className={cn(ROW_CLICK, filters.search === name && ROW_SELECTED)}
                    // El link abre el pago en otra pestaña; el resto de la fila filtra por el cliente.
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest("a")) toggleClient(name);
                    }}
                  >
                    <td className={TD}>
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir el pago en Cashport"
                          className="inline-flex items-center gap-[5px] text-[11px] font-semibold tabular-nums text-foreground underline-offset-2 hover:underline"
                        >
                          {p.id}
                          <ExternalLink className="h-[11px] w-[11px]" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold tabular-nums">{p.id}</span>
                      )}
                    </td>
                    <td className={TD}>
                      <span className={NAME}>{name}</span>
                      <span className={SUB}>{clientSub(ix, p.clientId)}</span>
                    </td>
                    <td className={cn(TD, HIDE_SM)}>
                      <span className="block tabular-nums">{paid.date}</span>
                      <span className={SUB}>
                        {paid.weekday} · {paid.time}
                      </span>
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <StatusChip sev={ageTone(days)} className="rounded tabular-nums">
                        {`${days ? `${days} d ` : ""}${p.pendingHours % 24} h`}
                      </StatusChip>
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <TowerTooltip
                        title="Pago sin aplicar"
                        rows={[{ key: "v", color, label: "Monto", value: full(p.amount) }]}
                      >
                        <span className={AMOUNT}>{money(p.amount)}</span>
                      </TowerTooltip>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className={EMPTY}>
                  No hay pagos pendientes de aplicar en esta vista
                </td>
              </tr>
            )}
            {rows.length > 0 && (
              <tr>
                <td className={TD_TOTAL}>Total</td>
                <td className={TD_TOTAL}>{payments(rows.length)}</td>
                <td className={cn(TD_TOTAL, HIDE_SM)} />
                <td className={cn(TD_TOTAL, "text-right")}>
                  <span className="text-[10.5px] font-normal text-muted-foreground">
                    {fmt(avgDays, 1)} días prom.
                  </span>
                </td>
                <td className={cn(TD_TOTAL, "text-right tabular-nums")}>{money(total)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
