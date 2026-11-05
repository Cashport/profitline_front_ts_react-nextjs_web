"use client";

import { useMemo, useState } from "react";

import type { IClosingPortfolioRow } from "@/types/closings/IClosings";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import { cn } from "@/utils/utils";

import { marketColor } from "../../constants";
import useIsMobile from "../../hooks/use-is-mobile";
import { useTableSort } from "../../hooks/use-table-sort";
import { sumBy } from "../../utils/aggregate";
import { formatAmount, formatMillions, formatPct } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import ClosingKpis from "../closing-kpis/closing-kpis";

/** Colores de las causales en orden de tamaño (paleta de mercados de DESIGN.md §1). */
const CAUSE_COLORS = ["#1677ff", "#2b4a5f", "#ff6a13", "#7b3fe4", "#e0007a", "#0e9aa7", "#9bb514"];
const causeColor = (i: number) => CAUSE_COLORS[i] ?? "#8a8a8a";

interface Props {
  portfolio: IClosingPortfolioRow[];
  onOpenClient: (nit: string) => void;
}

interface CauseRow {
  name: string;
  amount: number;
  documents: number;
  clients: number;
}

const groupCauses = (rows: IClosingPortfolioRow[]): CauseRow[] => {
  const map = new Map<string, { amount: number; documents: number; nits: Set<string> }>();
  rows.forEach((r) => {
    const e = map.get(r.balanceType) ?? { amount: 0, documents: 0, nits: new Set<string>() };
    e.amount += r.amount;
    e.documents += r.documents;
    e.nits.add(r.nit);
    map.set(r.balanceType, e);
  });
  return Array.from(map.entries())
    .map(([name, e]) => ({ name, amount: e.amount, documents: e.documents, clients: e.nits.size }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
};

function CauseBars({ rows, negative }: { rows: CauseRow[]; negative?: boolean }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.amount)), 1);
  const total = sumBy(rows, (r) => r.amount);
  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div
          key={r.name}
          className="grid grid-cols-[minmax(0,170px)_minmax(0,1fr)_96px_56px] items-center gap-3 py-[7px] text-[13px]"
        >
          <span className="truncate text-cp-ink" title={r.name}>
            {r.name}
          </span>
          <span className="h-4 overflow-hidden rounded bg-cp-muted">
            <span
              className="block h-full rounded"
              style={{ width: `${(Math.abs(r.amount) / max) * 100}%`, background: causeColor(i) }}
            />
          </span>
          <span
            className={cn(
              "text-right font-semibold tabular-nums",
              negative ? "text-cp-red" : "text-cp-ink"
            )}
          >
            {formatMillions(r.amount)}
          </span>
          <span className="text-right text-cp-ink-3">
            {formatPct(total ? r.amount / total : 0).replace(",0", "")}
          </span>
        </div>
      ))}
      <p className="pt-2 text-right text-[13px] text-cp-ink-3">Cifras en millones</p>
    </div>
  );
}

interface DetailRow {
  key: string;
  nit: string;
  client: string;
  market: string;
  executive: string;
  kind: string;
  cause: string;
  bucket: string;
  documents: number;
  amount: number;
}

/** Saldos y cruces: partidas abiertas (Tipo = Saldos) y notas crédito en cartera (Tipo = NC). */
export default function BalancesTab({ portfolio, onOpenClient }: Props) {
  const [kind, setKind] = useState<"Saldos" | "NC">("Saldos");
  const isMobile = useIsMobile();

  const balances = useMemo(() => portfolio.filter((r) => r.kind === "Saldos"), [portfolio]);
  const notes = useMemo(() => portfolio.filter((r) => r.kind === "NC"), [portfolio]);
  const balanceCauses = useMemo(() => groupCauses(balances), [balances]);
  const noteCauses = useMemo(() => groupCauses(notes), [notes]);

  const kpis = useMemo(() => {
    const open = sumBy(balances, (r) => r.amount);
    const over30 = sumBy(
      balances.filter((r) => r.bucket !== "Corriente" && r.bucket !== "0-30"),
      (r) => r.amount
    );
    const noteTotal = sumBy(notes, (r) => r.amount);
    const portfolioTotal = sumBy(portfolio, (r) => r.amount);
    return {
      open,
      over30,
      noteTotal,
      portfolioTotal,
      clients: new Set(balances.map((r) => r.nit)).size,
      noteClients: new Set(notes.map((r) => r.nit)).size
    };
  }, [balances, notes, portfolio]);

  const detail = useMemo<DetailRow[]>(() => {
    const source = kind === "Saldos" ? balances : notes;
    const map = new Map<string, DetailRow>();
    source.forEach((r) => {
      const key = `${r.nit}·${r.balanceType}`;
      const e =
        map.get(key) ??
        ({
          key,
          nit: r.nit,
          client: r.client,
          market: r.market,
          executive: r.executive,
          kind: r.kind,
          cause: r.balanceType,
          bucket: r.bucket,
          documents: 0,
          amount: 0
        } as DetailRow);
      e.amount += r.amount;
      e.documents += r.documents;
      map.set(key, e);
    });
    return Array.from(map.values());
  }, [balances, notes, kind]);

  const { sort, onSort, sorted } = useTableSort(
    detail,
    { col: "amount", dir: kind === "Saldos" ? "desc" : "asc" },
    (r, col) =>
      col === "amount" || col === "documents"
        ? (r[col] as number)
        : String(r[col as keyof DetailRow] ?? "")
  );

  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <ClosingKpis
        items={[
          {
            key: "open",
            label: "Saldos abiertos",
            value: formatMillions(kpis.open),
            unit: "M",
            caption: `${kpis.clients} clientes · ${formatPct(kpis.portfolioTotal ? kpis.open / kpis.portfolioTotal : 0)} de la cartera`
          },
          {
            key: "over30",
            label: "Saldos abiertos > 30 días",
            value: formatMillions(kpis.over30),
            unit: "M",
            bar: { value: kpis.open ? kpis.over30 / kpis.open : 0, color: "#d11a2a" },
            caption: `${formatPct(kpis.open ? kpis.over30 / kpis.open : 0)} de los saldos`
          },
          {
            key: "notes",
            label: "Notas en cartera",
            value: formatMillions(kpis.noteTotal),
            unit: "M",
            caption: `${kpis.noteClients} clientes con notas por cruzar`
          },
          {
            key: "top",
            label: "Causal principal",
            value: balanceCauses[0]?.name ?? "—",
            caption: balanceCauses[0]
              ? `${formatMillions(balanceCauses[0].amount)} M · ${formatPct(kpis.open ? balanceCauses[0].amount / kpis.open : 0)}`
              : undefined
          }
        ]}
      />

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-2">
        <ChartCard
          title="Saldos abiertos por causal"
          help="Partidas que la compañía tiene abiertas al cierre (Tipo = Saldos), por la causal que les asignó el equipo (Tipo saldo)."
        >
          <CauseBars rows={balanceCauses} />
        </ChartCard>
        <ChartCard
          title="Notas en cartera por causal"
          help="Notas crédito que siguen en la cartera al cierre (Tipo = NC), por segmento. Restan de la cartera hasta que se crucen."
        >
          <CauseBars rows={noteCauses} negative />
        </ChartCard>
      </div>

      <ChartCard
        title="Detalle por cliente y causal"
        help="Clic en un cliente para ver su ficha del cierre."
        actions={
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: "Saldos", label: "Saldos abiertos" },
              { value: "NC", label: "Notas en cartera" }
            ]}
          />
        }
      >
        <div className="max-h-[460px] overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] text-cp-ink">
            <colgroup>
              <col />
              <col style={{ width: isMobile ? 110 : 220 }} />
              {!isMobile && <col style={{ width: 96 }} />}
              {!isMobile && <col style={{ width: 96 }} />}
              <col style={{ width: isMobile ? 110 : 140 }} />
            </colgroup>
            <thead className="sticky top-0 z-[1]">
              <tr>
                <SortableTh
                  col="client"
                  label="Cliente"
                  sort={sort}
                  onSort={onSort}
                  className="pl-0"
                />
                <SortableTh col="cause" label="Causal" sort={sort} onSort={onSort} />
                {!isMobile && <SortableTh col="bucket" label="Tramo" sort={sort} onSort={onSort} />}
                {!isMobile && (
                  <SortableTh
                    col="documents"
                    label="Doc."
                    align="right"
                    sort={sort}
                    onSort={onSort}
                  />
                )}
                <SortableTh col="amount" label="Monto" align="right" sort={sort} onSort={onSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.key}
                  onClick={() => onOpenClient(r.nit)}
                  className="cursor-pointer hover:bg-cp-bg [&>td]:border-b [&>td]:border-cp-line"
                >
                  <td className="h-[var(--table-row-h)] py-2 pr-3">
                    <span className="block truncate font-medium text-cp-blue">{r.client}</span>
                    <span className="flex min-w-0 items-center gap-1.5 text-cp-ink-3">
                      <span className="truncate">{r.executive}</span>·
                      <span
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{ background: marketColor(r.market) }}
                      />
                      <span className="truncate">{r.market}</span>
                    </span>
                  </td>
                  <td className="truncate px-3">{r.cause}</td>
                  {!isMobile && <td className="px-3 text-cp-ink-2">{r.bucket}</td>}
                  {!isMobile && (
                    <td className="px-3 text-right tabular-nums text-cp-ink-2">{r.documents}</td>
                  )}
                  <td
                    className={cn(
                      "px-3 text-right font-semibold tabular-nums",
                      r.amount < 0 && "text-cp-red"
                    )}
                  >
                    {formatAmount(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {sorted.length > 0 && (
              <tfoot className="sticky bottom-0">
                <tr className="bg-cp-bg font-semibold [&>td]:border-t [&>td]:border-cp-line">
                  <td className="h-[var(--table-total-h)] pr-3" colSpan={isMobile ? 2 : 3}>
                    Total
                  </td>
                  {!isMobile && (
                    <td className="px-3 text-right tabular-nums">
                      {sumBy(sorted, (r) => r.documents)}
                    </td>
                  )}
                  <td className="px-3 text-right tabular-nums">
                    {formatAmount(sumBy(sorted, (r) => r.amount))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <p className="pt-2 text-right text-[13px] text-cp-ink-3">{sorted.length} partidas</p>
      </ChartCard>
    </div>
  );
}
