"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Select } from "antd";
import { ExternalLink, PanelRightOpen } from "lucide-react";

import PanelCard from "@/components/ui/panel-card/panel-card";
import { useModalDetail } from "@/context/ModalContext";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type {
  ICollectionTower,
  ITowerUnappliedPayment
} from "@/types/collectionTower/ICollectionTower";
import { PNA_AGES, PNA_DAYS_CRIT, PNA_DAYS_WARN } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { useProgressiveRows } from "../../hooks/use-progressive-rows";
import type { PnaAge } from "../../types";
import { CatalogIndex, indexCatalogs } from "../../utils/filters";
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
 * Tiempo pendiente del chip. El banco sólo trae la fecha del pago: sin hora,
 * las horas serían siempre las del corte ("8 h" en todos), así que va en días.
 */
const pendingLabel = (p: ITowerUnappliedPayment, hasTime: boolean) => {
  const days = pendingDays(p);
  if (!hasTime) return days ? `${days} d` : "Hoy";
  return `${days ? `${days} d ` : ""}${p.pendingHours % 24} h`;
};

interface UnappliedRowProps {
  p: ITowerUnappliedPayment;
  ix: CatalogIndex;
  color: string;
  selected: boolean;
  onToggle: (clientId: string) => void;
  onOpenPayment: (paymentId: string) => void;
}

/** Un pago. memo: al cambiar la selección sólo se repintan la fila que entra y la que sale. */
const UnappliedRow = memo(function UnappliedRow({
  p,
  ix,
  color,
  selected,
  onToggle,
  onOpenPayment
}: UnappliedRowProps) {
  const paid = fmtPaidAt(p.paidAt);
  return (
    <tr
      className={cn(ROW_CLICK, selected && ROW_SELECTED)}
      // El ID abre el detalle del pago; el resto de la fila filtra por el cliente.
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("a, button")) onToggle(p.clientId);
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
          // Cashport no tiene una URL por pago: el detalle es el mismo panel de Bancos y Clientes.
          <button
            type="button"
            onClick={() => onOpenPayment(p.id)}
            title="Ver el detalle del pago"
            className="inline-flex cursor-pointer items-center gap-[5px] border-0 bg-transparent p-0 text-[11px] font-semibold tabular-nums text-foreground underline-offset-2 hover:underline"
          >
            {p.id}
            <PanelRightOpen className="h-[11px] w-[11px]" />
          </button>
        )}
      </td>
      <td className={TD}>
        <span className={NAME}>{clientName(ix, p.clientId)}</span>
        <span className={SUB}>{clientSub(ix, p.clientId)}</span>
      </td>
      <td className={cn(TD, HIDE_SM)}>
        <span className="block tabular-nums">{paid.date}</span>
        <span className={SUB}>{paid.time ? `${paid.weekday} · ${paid.time}` : paid.weekday}</span>
      </td>
      <td className={cn(TD, "text-right")}>
        <StatusChip sev={ageTone(pendingDays(p))} className="rounded tabular-nums">
          {pendingLabel(p, Boolean(paid.time))}
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
});

/**
 * "Pagos identificados sin aplicar (PNA)": cada pago con su tiempo pendiente,
 * filtros rápidos por coordinador (selección múltiple) y por antigüedad.
 */
export default function UnappliedTable({ data }: { data: ICollectionTower }) {
  const { filters, toggleClient } = useTowerFilters();
  const { openModal } = useModalDetail();
  const [age, setAge] = useState<PnaAge>("all");
  const [coordinators, setCoordinators] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ col: "days", dir: "desc" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const ix = indexCatalogs(data.catalogs);
  const color = data.application.series.unapplied.color;
  const minDays = PNA_AGES.find((a) => a.id === age)?.minDays ?? null;
  const { rows, byCoordinator, active } = useMemo(
    () => unappliedRows(data.unappliedPayments, minDays, coordinators, sort, ix),
    [data.unappliedPayments, minDays, coordinators, sort, ix]
  );
  const { visible, hasMore, sentinelRef } = useProgressiveRows(rows, scrollRef);
  const periodKey = data.period.key;
  const { total, previous, avgDays } = useMemo(() => {
    const amount = sumBy(rows, (p) => p.amount);
    return {
      total: amount,
      // La tabla trae también los pagos de meses anteriores que siguen abiertos; la
      // tarjeta de aplicación, sólo los del mes. Esta parte es la diferencia entre ambas.
      previous: sumBy(
        rows.filter((p) => p.paidAt.slice(0, 7) < periodKey),
        (p) => p.amount
      ),
      avgDays: amount ? sumBy(rows, (p) => (p.amount * p.pendingHours) / 24) / amount : 0
    };
  }, [rows, periodKey]);
  const openPayment = useCallback(
    (paymentId: string) => openModal("payment", { paymentId: Number(paymentId) }),
    [openModal]
  );

  const toggleCoordinator = (id: string) =>
    setCoordinators((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const hint = `${
    active.length
      ? `${plural(active.length, "coordinador filtrando", "coordinadores filtrando")} · `
      : ""
  }${payments(rows.length)} · ${money(total)}${
    previous ? ` (${money(previous)} de meses anteriores)` : ""
  }`;

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

      <div
        ref={scrollRef}
        className="scrollbar-thin max-h-[min(560px,calc(100vh_-_150px))] overflow-y-auto border-t border-border"
      >
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
              visible.map((p) => (
                <UnappliedRow
                  key={`${p.id}-${p.paidAt}`}
                  p={p}
                  ix={ix}
                  color={color}
                  selected={filters.client === p.clientId}
                  onToggle={toggleClient}
                  onOpenPayment={openPayment}
                />
              ))
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className={EMPTY}>
                  No hay pagos pendientes de aplicar en esta vista
                </td>
              </tr>
            )}
            {hasMore && <SentinelRow ref={sentinelRef} colSpan={COLUMNS.length} />}
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
