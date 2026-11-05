"use client";

import { useMemo, useState } from "react";
import { Select, Tooltip } from "antd";

import { AGING_BUCKETS, type IClosingPortfolioRow } from "@/types/closings/IClosings";

import { AGING_COLORS, AGING_LABELS, marketColor, HIGH_OVERDUE } from "../../constants";
import { groupPortfolio, portfolioTotals, type PortfolioDimension } from "../../utils/aggregate";
import { formatM1, formatMillions, formatPct } from "../../utils/format";
import ChartCard from "../chart-card/chart-card";
import { Pill } from "../closing-kpis/closing-kpis";

/* Opciones del desplegable "Por …". Para sumar otra (ciudad, holding…) basta agregarla aquí y en
   PortfolioDimension, siempre que el atributo venga del cliente en /portfolio-closings. */
const DIMENSIONS: { value: PortfolioDimension; label: string; title: string }[] = [
  { value: "market", label: "Mercado", title: "mercado" },
  { value: "executive", label: "Ejecutivo", title: "ejecutivo" },
  { value: "kamLeader", label: "KAM líder", title: "KAM líder" },
  { value: "kam", label: "KAM", title: "KAM" }
];

interface Props {
  rows: IClosingPortfolioRow[];
  /** Clic en una fila: filtra todo el tablero por ese valor de la dimensión. */
  onSelect?: (dimension: PortfolioDimension, value: string) => void;
}

/**
 * Distribución por edades y mercado: cada mercado es una barra al 100% por tramo, con su peso en
 * la cartera. Reemplaza el treemap del Power BI, que no deja leer los tramos pequeños.
 */
interface AgingRow {
  name: string;
  total: number;
  overdue: number;
  buckets: Record<(typeof AGING_BUCKETS)[number], number>;
}

/** Tooltip de la barra: cada tramo en millones y su %, con el total vencido y el total. */
function AgingTooltip({ row }: { row: AgingRow }) {
  const pct = (v: number) => formatPct(row.total ? v / row.total : 0).replace(",0 %", " %");
  const line = (label: React.ReactNode, value: number, strong = false, top = false) => (
    <div
      className="grid grid-cols-[1fr_auto_52px] items-center gap-x-3 py-[5px]"
      style={{ borderTop: top ? "1px solid #3a3a3a" : undefined }}
    >
      <span className={strong ? "font-semibold text-white" : "text-[#bdbdbd]"}>{label}</span>
      <span
        className={`text-right tabular-nums ${strong ? "font-semibold" : "font-medium"} text-white`}
      >
        {formatM1(value)}
      </span>
      <span className="text-right tabular-nums text-[#bdbdbd]">{pct(value)}</span>
    </div>
  );
  return (
    <div className="w-[300px] max-w-[80vw] rounded-xl bg-[#141414] px-3.5 py-3 text-[13px] text-white shadow-[0_12px_32px_rgba(0,0,0,.22)]">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-[#2e2e2e] pb-2">
        <span className="truncate font-semibold">{row.name}</span>
        <span className="shrink-0 text-[#bdbdbd]">Millones</span>
      </div>
      {AGING_BUCKETS.map((b) => (
        <div key={b}>
          {line(
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: AGING_COLORS[b] }} />
              {AGING_LABELS[b]}
            </span>,
            row.buckets[b]
          )}
        </div>
      ))}
      {line("Total vencido", row.overdue, true, true)}
      {line("Total", row.total, true)}
    </div>
  );
}

export default function AgingByMarket({ rows, onSelect }: Props) {
  const [selected, setSelected] = useState<PortfolioDimension>("market");
  // Con un solo mercado (filtrado) la tabla por mercado tendría una fila: se baja a ejecutivos.
  const singleMarket = useMemo(() => new Set(rows.map((r) => r.market)).size === 1, [rows]);
  const dimension = selected === "market" && singleMarket ? "executive" : selected;
  const dimensionInfo = DIMENSIONS.find((d) => d.value === dimension) ?? DIMENSIONS[0];
  const { groups, totalRow, total } = useMemo(() => {
    const totals = portfolioTotals(rows);
    const grouped = groupPortfolio(rows, dimension);
    const totalEntry = { name: "Total", ...totals, clients: totals.clients };
    return {
      groups: grouped,
      totalRow: totalEntry,
      total: totals.total
    };
  }, [rows, dimension]);

  const renderRow = (c: (typeof groups)[number]) => {
    const isTotal = c.name === "Total";
    return (
      <button
        key={c.name}
        type="button"
        disabled={isTotal || !onSelect}
        onClick={() => onSelect?.(dimension, c.name)}
        className={`grid w-full grid-cols-[minmax(0,1fr)_minmax(56px,110px)_68px_48px_68px_60px] max-sm:grid-cols-[minmax(0,96px)_minmax(0,1fr)_62px_56px] max-sm:gap-2 items-center gap-3 border-b border-cp-line py-[5px] text-left text-[13px] ${
          isTotal ? "border-b-0 bg-cp-bg font-semibold" : "hover:bg-cp-bg"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {!isTotal && dimension === "market" && (
            <span
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: marketColor(c.name) }}
            />
          )}
          <span className="truncate text-cp-ink" title={c.name}>
            {c.name}
          </span>
        </span>
        <Tooltip
          color="transparent"
          overlayStyle={{ maxWidth: 340 }}
          overlayInnerStyle={{ padding: 0, boxShadow: "none" }}
          title={<AgingTooltip row={c} />}
        >
          <span className="flex h-[10px] min-w-0 gap-[2px] overflow-hidden rounded">
            {AGING_BUCKETS.map((b) =>
              c.buckets[b] > 0 ? (
                <span
                  key={b}
                  className="h-full"
                  style={{
                    flexGrow: c.buckets[b],
                    flexBasis: 0,
                    background: AGING_COLORS[b]
                  }}
                />
              ) : null
            )}
          </span>
        </Tooltip>
        <span className="text-right font-semibold tabular-nums text-cp-ink">
          {formatMillions(c.total)}
        </span>
        <span className="text-right tabular-nums text-cp-ink-3 max-sm:hidden">
          {formatPct(total ? c.total / total : 0).replace(",0", "")}
        </span>
        <span className="text-right tabular-nums text-cp-ink max-sm:hidden">
          {formatMillions(c.overdue)}
        </span>
        <span className="flex justify-end">
          <Pill tone={c.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
            {formatPct(c.overduePct).replace(" %", "%")}
          </Pill>
        </span>
      </button>
    );
  };

  return (
    <ChartCard
      title={`Edades por ${dimensionInfo.title}`}
      help="Reparto de la cartera por tramo de vencimiento (cifras en millones): el ancho de la barra es el 100 % del grupo; Peso es su parte de la cartera total y Vencido, lo vencido en plata y en %. Pasa el mouse por la barra para ver cada tramo; clic en una fila para filtrar el tablero."
      actions={
        <Select
          value={selected}
          onChange={setSelected}
          options={DIMENSIONS.map((d) => ({ value: d.value, label: `Por ${d.title}` }))}
          variant="filled"
          popupMatchSelectWidth={false}
          className="h-[var(--control-h)] min-w-[150px]"
          aria-label="Agrupar edades por"
        />
      }
      className="h-full"
    >
      <div className="flex max-h-[330px] min-h-0 flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(56px,110px)_68px_48px_68px_60px] max-sm:grid-cols-[minmax(0,96px)_minmax(0,1fr)_62px_56px] max-sm:gap-2 items-center gap-3 overflow-hidden border-b border-cp-line pb-1.5 text-[13.5px] font-semibold text-cp-ink [scrollbar-gutter:stable]">
          <span>{dimensionInfo.label}</span>
          <span>Tramos</span>
          <span className="text-right">Cartera</span>
          <span className="text-right max-sm:hidden">Peso</span>
          <span className="text-right max-sm:hidden">Vencido</span>
          <span className="text-right">% Venc.</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          {groups.map(renderRow)}
        </div>
        <div className="overflow-hidden border-t border-cp-line-2 [scrollbar-gutter:stable]">
          {renderRow(totalRow)}
        </div>
      </div>
    </ChartCard>
  );
}
