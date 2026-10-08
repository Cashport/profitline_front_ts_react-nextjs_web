"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useInView } from "react-intersection-observer";
import { useShallow } from "zustand/react/shallow";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import ProgressVsGoal from "@/components/ui/progress-vs-goal/progress-vs-goal";
import StatusBadge from "@/components/ui/status-badge/status-badge";
import type {
  ClientsHomeAgingBucket,
  ClientsHomeForecastStatus,
  ClientsHomeSortColumn,
  IClientsHomeCatalogItem,
  IClientsHomeClients,
  IClientsHomeRow
} from "@/types/clients/IClientsHome";
import {
  AGING_BUCKETS,
  AGING_BY_KEY,
  COLLECTION_COLORS,
  EMPTY_MARKET_COLOR,
  FORECAST_STATUS,
  FORECAST_STATUS_ORDER,
  GOAL_SCALE,
  MARKET_PALETTE,
  forecastStyle,
  pastDuePill
} from "../../../constants/clients-home";
import { useClientsHomeFilters } from "../../../stores/clients-home-filters";
import { clientsLabel, fmt, money, pct1, pctInt } from "../../../utils/clients-home-format";
import AgingBreakdownTooltip, {
  AGING_TIP_SIZE
} from "../aging-breakdown-tooltip/aging-breakdown-tooltip";
import CollectionTooltip, { COLLECTION_TIP_SIZE } from "../collection-tooltip/collection-tooltip";

interface ClientsHomeTableProps {
  markets: IClientsHomeCatalogItem[];
  executives: IClientsHomeCatalogItem[];
  rows: IClientsHomeRow[];
  meta: IClientsHomeClients | null;
  loading: boolean;
  /** Recargando con filtros nuevos (se muestran los datos anteriores atenuados). */
  refreshing: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

interface Column {
  key: string;
  label: string;
  sort?: ClientsHomeSortColumn;
  justify: "flex-start" | "flex-end";
  width: string;
  extra?: "qf-name" | "expand" | "qf-fc";
}

type Tip = { kind: "aging" | "rec"; id: string; x: number; y: number } | null;
type QuickFilter = { kind: "name" | "fc"; x: number; y: number } | null;

const ROW_PAD = "10px 14px";
const detailHref = (row: IClientsHomeRow) =>
  `/clientes/detail/${row.clientUuid}/project/${row.projectId}`;

/** Ubica un popover debajo del botón o, si no cabe, encima. */
const popY = (b: DOMRect, height: number) =>
  b.bottom + 6 + height <= window.innerHeight - 8
    ? b.bottom + 6
    : Math.max(8, Math.min(b.top - height - 6, window.innerHeight - height - 8));

/** Tooltip debajo de la celda o, si no cabe, encima. */
const tipPosition = (b: DOMRect, size: { width: number; height: number }) => {
  const W = Math.min(size.width, window.innerWidth - 16);
  const x = Math.max(8, Math.min(b.left, window.innerWidth - W - 8));
  const y =
    b.bottom + 8 + size.height > window.innerHeight ? b.top - size.height - 8 : b.bottom + 8;
  return { x, y: Math.max(8, y) };
};

/** Primer ancestro con scroll vertical (el contenedor de la vista). */
const scrollParentOf = (el: HTMLElement | null): HTMLElement | null => {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
};

const col = (
  key: string,
  label: string,
  sort: ClientsHomeSortColumn | undefined,
  width: string,
  extra?: Column["extra"]
): Column => ({
  key,
  label,
  sort,
  justify: key === "name" ? "flex-start" : "flex-end",
  width,
  extra
});

export default function ClientsHomeTable({
  markets,
  executives,
  rows,
  meta,
  loading,
  refreshing,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: ClientsHomeTableProps) {
  const router = useRouter();
  const f = useClientsHomeFilters(
    useShallow((s) => ({
      search: s.search,
      setSearch: s.setSearch,
      markets: s.markets,
      toggleMarket: s.toggleMarket,
      setMarkets: s.setMarkets,
      executives: s.executives,
      toggleExecutive: s.toggleExecutive,
      setExecutives: s.setExecutives,
      forecastStatuses: s.forecastStatuses,
      toggleForecastStatus: s.toggleForecastStatus,
      setForecastStatuses: s.setForecastStatuses,
      sortBy: s.sortBy,
      sortDir: s.sortDir,
      sortByColumn: s.sortByColumn
    }))
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1400);
  const [expAge, setExpAge] = useState(false);
  const [tip, setTip] = useState<Tip>(null);
  const [qf, setQf] = useState<QuickFilter>(null);
  const [totFixed, setTotFixed] = useState<{ left: number; width: number } | null>(null);
  const { ref: sentinelRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Columnas según el ancho real de la tarjeta (no del viewport).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Como en el diseño: la rueda baja primero la página hasta que la tabla
  // ocupa la pantalla, y recién ahí desplaza las filas. Mientras la tabla
  // sigue por debajo del borde, la fila de totales queda fija abajo.
  useEffect(() => {
    const parent = scrollParentOf(cardRef.current);
    if (!parent) return;
    const onWheel = (e: WheelEvent) => {
      const max = parent.scrollHeight - parent.clientHeight - 1;
      if (e.deltaY > 0 && parent.scrollTop < max) {
        e.preventDefault();
        parent.scrollTop = Math.min(parent.scrollTop + e.deltaY, max + 1);
      }
    };
    const onScroll = () => {
      const card = cardRef.current;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const rs = rowsRef.current?.getBoundingClientRect() ?? r;
      const H = window.innerHeight;
      const fixed = r.bottom > H - 4 && rs.top + 132 < H;
      setTotFixed((prev) => {
        const next = fixed
          ? { left: Math.round(r.left + 10), width: Math.round(r.width - 20) }
          : null;
        return prev?.left === next?.left && prev?.width === next?.width ? prev : next;
      });
    };
    parent.addEventListener("wheel", onWheel, { passive: false });
    parent.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    requestAnimationFrame(onScroll);
    const t = setTimeout(onScroll, 300);
    return () => {
      parent.removeEventListener("wheel", onWheel);
      parent.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
    };
  }, []);

  const focus = meta?.agingFocus ?? null;
  const cardMode = width < 820;
  const showAgeCols = expAge && !cardMode;
  const ex = showAgeCols ? 620 : 0;
  const cVenc = width >= 940 + ex;
  const cNotasPna = width >= 1120 + ex;

  const columns: Column[] = [
    col("name", "Nombre", "name", "minmax(120px,1.8fr)", "qf-name"),
    col(
      "cartera",
      focus ? `Cartera ${AGING_BY_KEY[focus].label}` : "Cartera",
      "portfolio",
      "minmax(120px,1fr)",
      "expand"
    ),
    ...(showAgeCols
      ? AGING_BUCKETS.map((b) => col(`ag-${b.key}`, b.label, `aging:${b.key}`, "minmax(78px,.7fr)"))
      : []),
    ...(cVenc
      ? [
          col("venc", "Vencida", "pastDue", "minmax(100px,.85fr)"),
          col("vpct", "% Venc.", "pastDuePct", "minmax(84px,.6fr)")
        ]
      : []),
    ...(cNotasPna
      ? [
          col("notas", "Notas", "creditNotes", "minmax(80px,.7fr)"),
          col("pna", "PNA", "unappliedPayments", "minmax(80px,.7fr)")
        ]
      : []),
    col("rec", "Recaudo vs meta", "collectedPct", "minmax(100px,.75fr)"),
    col("fc", "Forecast", "forecastPct", "minmax(80px,.55fr)", "qf-fc"),
    col("chev", "", undefined, "20px")
  ];
  const gridCols = columns.map((c) => c.width).join(" ");

  const focusMax = focus ? Math.max(0, ...rows.map((r) => r.aging[focus])) : 0;
  const totals = meta?.totals;
  const tipRow = tip ? rows.find((r) => r.clientId === tip.id) : undefined;

  const openQf = (kind: "name" | "fc", e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const b = e.currentTarget.getBoundingClientRect();
    setQf((cur) =>
      cur?.kind === kind
        ? null
        : {
            kind,
            x: Math.max(
              8,
              Math.min(kind === "name" ? b.left - 8 : b.right - 240, window.innerWidth - 248)
            ),
            y: popY(b, 300)
          }
    );
  };

  const showTip = (
    kind: "aging" | "rec",
    row: IClientsHomeRow,
    e: React.MouseEvent<HTMLElement>
  ) => {
    const pos = tipPosition(
      e.currentTarget.getBoundingClientRect(),
      kind === "aging" ? AGING_TIP_SIZE : COLLECTION_TIP_SIZE
    );
    setTip({ kind, id: row.clientId, ...pos });
  };

  // ---------- Celdas ----------

  const portfolioBar = (row: IClientsHomeRow, height: number) =>
    focus ? (
      <AgingBar
        height={height}
        gap={1}
        segments={[
          { key: focus, value: Math.max(0, row.aging[focus]), color: AGING_BY_KEY[focus].color },
          { key: "rest", value: focusMax - Math.max(0, row.aging[focus]), color: "#f2f2f2" }
        ]}
      />
    ) : (
      <AgingBar
        height={height}
        gap={1}
        segments={AGING_BUCKETS.map((b) => ({
          key: b.key,
          value: row.aging[b.key],
          color: b.color
        }))}
      />
    );

  const renderCell = (column: Column, row: IClientsHomeRow) => {
    const c = row.collection;
    switch (column.key) {
      case "name":
        return (
          <div className="flex min-w-0 flex-col gap-px">
            <Link
              href={detailHref(row)}
              title={row.clientName}
              onClick={(e) => e.stopPropagation()}
              className="block min-w-0 truncate text-[12.5px] font-medium leading-[1.3] text-[#1677ff] hover:text-[#0b5bd3] hover:underline"
            >
              {row.clientName}
            </Link>
            <span className="truncate text-[10px] leading-[1.2] text-[#9a9a9a]">
              {row.executive.name ?? "Sin ejecutivo"} · {row.market.name ?? "Sin mercado"}
            </span>
          </div>
        );
      case "cartera":
        return (
          <div
            onMouseEnter={(e) => showTip("aging", row, e)}
            onMouseLeave={() => setTip(null)}
            className="flex min-w-0 flex-col items-stretch gap-[5px] py-1"
          >
            <div className="whitespace-nowrap text-right text-[13px] font-semibold leading-[1.1] tabular-nums">
              {fmt(focus ? row.aging[focus] : row.portfolio)}
            </div>
            {portfolioBar(row, 4)}
          </div>
        );
      case "venc":
        return (
          <div className="whitespace-nowrap text-right text-[13px] tabular-nums">
            {fmt(row.pastDue)}
          </div>
        );
      case "vpct": {
        const pill = pastDuePill(row.pastDuePct);
        return (
          <div className="flex justify-end">
            <StatusBadge bg={pill.bg} color={pill.color}>
              {pct1(row.pastDuePct)}
            </StatusBadge>
          </div>
        );
      }
      case "notas":
        return (
          <div
            className="whitespace-nowrap text-right text-[13px] tabular-nums"
            style={{ color: row.creditNotes.amount ? "#141414" : "#b5b5b5" }}
          >
            {money(row.creditNotes.amount)}
          </div>
        );
      case "pna":
        return (
          <div
            className="whitespace-nowrap text-right text-[13px] tabular-nums"
            style={{
              color: row.unappliedPayments.amount ? "#c24a00" : "#b5b5b5",
              fontWeight: row.unappliedPayments.amount ? 600 : 400
            }}
          >
            {money(row.unappliedPayments.amount)}
          </div>
        );
      case "rec":
        return (
          <div
            onMouseEnter={(e) => showTip("rec", row, e)}
            onMouseLeave={() => setTip(null)}
            className="relative flex min-w-0 flex-col items-stretch gap-[5px] py-1"
          >
            <div className="flex items-baseline justify-end gap-1.5 whitespace-nowrap text-[13px] leading-[1.1] tabular-nums">
              <span className="font-semibold">{fmt(c.collected)}</span>
              <span className="text-[11px] text-[#8a8a8a]">{pctInt(c.collectedPct)}</span>
            </div>
            <ProgressVsGoal
              height={4}
              goal={c.goal}
              goalScale={GOAL_SCALE}
              segments={[
                { key: "collected", value: c.collected, color: COLLECTION_COLORS.collected },
                {
                  key: "active",
                  value: c.agreementsActive,
                  color: COLLECTION_COLORS.agreementsActive
                },
                {
                  key: "broken",
                  value: c.agreementsBroken,
                  color: COLLECTION_COLORS.agreementsBroken
                }
              ]}
            />
          </div>
        );
      case "fc": {
        const s = forecastStyle(c.forecastPct);
        return (
          <div className="flex justify-end">
            <StatusBadge
              dot={s.dot}
              bg={s.bg}
              color={s.color}
              width={48}
              title={`Forecast ${fmt(c.forecast)}`}
            >
              {pctInt(c.forecastPct)}
            </StatusBadge>
          </div>
        );
      }
      case "chev":
        return (
          <div className="flex justify-end">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b5b5b5"
              strokeWidth="2"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>
        );
      default: {
        // Columnas de edades desplegadas ("ag-<tramo>").
        const v = row.aging[column.key.slice(3) as ClientsHomeAgingBucket];
        return (
          <div
            className="whitespace-nowrap text-right text-[12.5px] tabular-nums"
            style={{ color: v ? "#141414" : "#b5b5b5" }}
          >
            {money(v)}
          </div>
        );
      }
    }
  };

  const renderTotal = (column: Column) => {
    if (!totals) return <div key={column.key} />;
    const c = totals.collection;
    const num = "whitespace-nowrap text-right text-[13px] font-semibold tabular-nums";
    switch (column.key) {
      case "name":
        return (
          <div key={column.key} className="truncate whitespace-nowrap text-[13px] font-semibold">
            Total{" "}
            <span className="text-[11.5px] font-normal text-[#8a8a8a]">
              · {clientsLabel(totals.clients)}
            </span>
          </div>
        );
      case "cartera":
        return (
          <div key={column.key} className={num}>
            {fmt(focus ? totals.focusPortfolio : totals.portfolio)}
          </div>
        );
      case "venc":
        return (
          <div key={column.key} className={num}>
            {fmt(totals.pastDue)}
          </div>
        );
      case "vpct": {
        const pill = pastDuePill(totals.pastDuePct, true);
        return (
          <div key={column.key} className="flex justify-end">
            <StatusBadge bg={pill.bg} color={pill.color}>
              {pct1(totals.pastDuePct)}
            </StatusBadge>
          </div>
        );
      }
      case "notas":
        return (
          <div key={column.key} className={num}>
            {money(totals.creditNotes.amount)}
          </div>
        );
      case "pna":
        return (
          <div key={column.key} className={num}>
            {money(totals.unappliedPayments.amount)}
          </div>
        );
      case "rec":
        return (
          <div
            key={column.key}
            className="flex items-baseline justify-end gap-1.5 whitespace-nowrap text-[13px] tabular-nums"
          >
            <span className="font-semibold">{fmt(c.collected)}</span>
            <span className="text-[11px] text-[#8a8a8a]">{pctInt(c.collectedPct)}</span>
          </div>
        );
      case "fc": {
        const s = forecastStyle(c.forecastPct, true);
        return (
          <div key={column.key} className="flex justify-end">
            <StatusBadge dot={s.dot} bg={s.bg} color={s.color} width={48}>
              {pctInt(c.forecastPct)}
            </StatusBadge>
          </div>
        );
      }
      case "chev":
        return <div key={column.key} />;
      default:
        return (
          <div key={column.key} className={`${num} text-[12.5px]`}>
            {money(totals.aging[column.key.slice(3) as ClientsHomeAgingBucket])}
          </div>
        );
    }
  };

  // ---------- Encabezados ----------

  const header = (column: Column) => {
    const active = column.sort !== undefined && f.sortBy === column.sort;
    return (
      <div
        key={column.key}
        onClick={() => column.sort && f.sortByColumn(column.sort)}
        className="flex cursor-pointer select-none items-center gap-1 whitespace-nowrap text-[13.5px] font-semibold text-[#141414]"
        style={{ justifyContent: column.justify }}
      >
        {column.label}
        {column.sort && (
          <span className="ml-0.5 flex flex-col gap-px">
            <span
              className="h-0 w-0 border-x-[3.5px] border-b-4 border-x-transparent"
              style={{ borderBottomColor: active && f.sortDir === "asc" ? "#141414" : "#c4c4c4" }}
            />
            <span
              className="h-0 w-0 border-x-[3.5px] border-t-4 border-x-transparent"
              style={{ borderTopColor: active && f.sortDir === "desc" ? "#141414" : "#c4c4c4" }}
            />
          </span>
        )}
        {column.extra === "expand" && (
          <button
            type="button"
            title={showAgeCols ? "Ocultar edades" : "Ver edades en columnas"}
            onClick={(e) => {
              e.stopPropagation();
              setExpAge((v) => !v);
            }}
            className="ml-1 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-[5px] p-0 text-xs font-semibold leading-none text-[#141414] hover:!border-[#141414]"
            style={{
              border: `1px solid ${showAgeCols ? "#141414" : "#d6d6d6"}`,
              background: showAgeCols ? "#f4f9d2" : "#fff"
            }}
          >
            {showAgeCols ? "−" : "+"}
          </button>
        )}
        {column.extra === "qf-name" && (
          <QuickFilterButton
            on={f.executives.length > 0}
            title="Filtrar Ejecutivo"
            onClick={(e) => openQf("name", e)}
          />
        )}
        {column.extra === "qf-fc" && (
          <QuickFilterButton
            on={f.forecastStatuses.length > 0}
            title="Filtrar Forecast"
            onClick={(e) => openQf("fc", e)}
          />
        )}
      </div>
    );
  };

  // ---------- Leyenda de mercados ----------

  let paletteIndex = 0;
  const marketItems = markets.map((m) => ({
    ...m,
    color: m.name ? MARKET_PALETTE[paletteIndex++ % MARKET_PALETTE.length] : EMPTY_MARKET_COLOR
  }));
  const anyMarket = f.markets.length > 0;
  const total = meta?.pagination.total ?? 0;
  const mkHint = anyMarket
    ? `${f.markets.length} ${
        f.markets.length > 1 ? "mercados filtrando" : "mercado filtrando"
      } la tabla · ${clientsLabel(total)}`
    : "clic en un mercado para filtrar · clic en varios para sumarlos";

  const empty = !loading && !error && rows.length === 0;

  return (
    <div
      ref={cardRef}
      className="box-border flex min-h-[320px] min-w-0 flex-none flex-col rounded-[14px] bg-white px-2.5 pb-2 pt-3"
      style={{ height: "calc(100vh - 100px)" }}
    >
      {/* Título, mercados y buscador */}
      <div className="flex flex-none flex-wrap items-start justify-between gap-x-4 gap-y-2.5 px-1.5 pb-3 pt-2">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
          <div className="flex min-w-0 flex-nowrap items-baseline gap-x-2.5 gap-y-1 leading-[1.35]">
            <span className="whitespace-nowrap text-[15px] font-semibold text-[#141414]">
              Cartera por cliente
            </span>
            <span className="min-w-0 flex-[1_1_0] truncate text-[11.5px] leading-[1.35] text-[#8a8a8a]">
              {mkHint}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 pl-[7px]">
            {marketItems.map((m) => {
              const on = f.markets.includes(m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => f.toggleMarket(m.key)}
                  className="-ml-[7px] flex h-6 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-[7px] text-[12.5px] font-medium hover:!text-[#141414]"
                  style={{
                    border: `1px solid ${on ? "#cbe71e" : "transparent"}`,
                    background: on ? "#f4f9d2" : "transparent",
                    color: on ? "#141414" : anyMarket ? "#a8a8a8" : "#6b6b6b"
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: m.color, opacity: on || !anyMarket ? 1 : 0.45 }}
                  />
                  {m.name ?? "Sin mercado"}
                </button>
              );
            })}
            {anyMarket && (
              <button
                type="button"
                onClick={() => f.setMarkets([])}
                className="cursor-pointer whitespace-nowrap border-0 bg-transparent px-1 text-xs font-semibold text-[#141414] hover:underline"
              >
                Quitar filtro
              </button>
            )}
          </div>
        </div>
        <div className="flex min-w-[200px] flex-[0_1_340px] flex-col items-end gap-1.5">
          <div className="box-border flex h-10 w-full items-center gap-2.5 rounded-lg bg-[#f7f7f7] px-3.5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#141414"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              placeholder="Buscar cliente, NIT, ejecutivo"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-[#141414] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <span className="whitespace-nowrap text-[11.5px] text-[#8a8a8a]">
            {meta ? clientsLabel(total) : " "}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!cardMode ? (
            <>
              <div
                ref={rowsRef}
                className="min-h-0 flex-[1_1_0] overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin]"
                style={{ opacity: refreshing ? 0.6 : 1 }}
              >
                <div
                  className="sticky top-0 z-[3] grid items-center gap-x-3.5 border-b border-[#ececec] bg-white p-3.5"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {columns.map(header)}
                </div>
                {rows.map((row) => (
                  <div
                    key={row.clientId}
                    onClick={() => router.push(detailHref(row))}
                    className="grid cursor-pointer items-center gap-x-3.5 border-b border-[#f0f0f0] hover:bg-[#fafafa]"
                    style={{ gridTemplateColumns: gridCols, padding: ROW_PAD }}
                  >
                    {columns.map((column) => (
                      <div key={column.key} className="min-w-0">
                        {renderCell(column, row)}
                      </div>
                    ))}
                  </div>
                ))}
                {empty && <EmptyState />}
                {error && <ErrorState message={error.message} />}
                <div ref={sentinelRef} className="h-px" />
                {(loading || isFetchingNextPage) && <Loading />}
              </div>
              {rows.length > 0 && totals && (
                <div
                  className="box-border grid flex-none items-center gap-x-3.5 overflow-hidden border-t border-[#e3e3e3] bg-[#f7f7f7] px-3.5 py-3 shadow-[0_-6px_12px_-8px_rgba(0,0,0,.12)] [scrollbar-gutter:stable]"
                  style={{
                    gridTemplateColumns: gridCols,
                    position: totFixed ? "fixed" : "relative",
                    left: totFixed ? totFixed.left : "auto",
                    width: totFixed ? totFixed.width : "auto",
                    bottom: 8,
                    zIndex: 30
                  }}
                >
                  {columns.map(renderTotal)}
                </div>
              )}
              <div className="flex-none" style={{ height: totFixed ? 46 : 0 }} />
            </>
          ) : (
            <CardList
              rows={rows}
              onOpen={(row) => router.push(detailHref(row))}
              portfolioBar={portfolioBar}
              focus={focus}
              loading={loading || isFetchingNextPage}
              sentinelRef={sentinelRef}
              footer={
                <>
                  {empty && <EmptyState />}
                  {error && <ErrorState message={error.message} />}
                </>
              }
            />
          )}
        </div>
      </div>

      {tip &&
        tipRow &&
        createPortal(
          <div className="pointer-events-none fixed z-[60]" style={{ left: tip.x, top: tip.y }}>
            {tip.kind === "aging" ? (
              <AgingBreakdownTooltip row={tipRow} />
            ) : (
              <CollectionTooltip row={tipRow} />
            )}
          </div>,
          document.body
        )}

      {qf &&
        createPortal(
          <QuickFilterPopover
            x={qf.x}
            y={qf.y}
            title={qf.kind === "name" ? "Ejecutivo" : "Forecast"}
            options={
              qf.kind === "name"
                ? executives.map((e) => ({
                    key: e.key,
                    label: e.name ?? "Sin ejecutivo",
                    n: e.clients,
                    on: f.executives.includes(e.key)
                  }))
                : FORECAST_STATUS_ORDER.map((k) => ({
                    key: k,
                    label: FORECAST_STATUS[k].label,
                    dot: FORECAST_STATUS[k].dot,
                    n: meta?.forecastStatusCounts[k] ?? 0,
                    on: f.forecastStatuses.includes(k)
                  }))
            }
            onToggle={(key) =>
              qf.kind === "name"
                ? f.toggleExecutive(key)
                : f.toggleForecastStatus(key as ClientsHomeForecastStatus)
            }
            onClear={() => (qf.kind === "name" ? f.setExecutives([]) : f.setForecastStatuses([]))}
            onClose={() => setQf(null)}
          />,
          document.body
        )}
    </div>
  );
}

const EmptyState = () => (
  <div className="p-12 text-center text-[13px] text-[#6b6b6b]">
    Ningún cliente coincide con la búsqueda o los filtros.
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-12 text-center text-[13px] text-[#b0124a]">{message}</div>
);

const Loading = () => (
  <div className="flex justify-center py-6">
    <Spin size="small" />
  </div>
);

const QuickFilterButton = ({
  on,
  title,
  onClick
}: {
  on: boolean;
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="relative ml-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-[5px] border-0 p-0 hover:!bg-[#ececec]"
    style={{ background: on ? "#f4f9d2" : "transparent" }}
  >
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={on ? "#141414" : "none"}
      stroke={on ? "#141414" : "#a0a0a0"}
      strokeWidth="2.4"
      strokeLinejoin="round"
    >
      <path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" />
    </svg>
  </button>
);

interface QuickFilterOption {
  key: string;
  label: string;
  n: number;
  on: boolean;
  dot?: string;
}

const QuickFilterPopover = ({
  x,
  y,
  title,
  options,
  onToggle,
  onClear,
  onClose
}: {
  x: number;
  y: number;
  title: string;
  options: QuickFilterOption[];
  onToggle: (key: string) => void;
  onClear: () => void;
  onClose: () => void;
}) => (
  <>
    <div onClick={onClose} className="fixed inset-0 z-[70] cursor-default" />
    <div
      className="fixed z-[71] box-border flex max-h-[min(420px,calc(100vh-140px))] w-60 cursor-default flex-col gap-0.5 overflow-y-auto rounded-xl border border-[#ececec] bg-white p-1.5 font-normal shadow-[0_12px_32px_rgba(0,0,0,.16)]"
      style={{ left: x, top: y }}
    >
      <div className="flex flex-col gap-0.5">
        <div className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[.4px] text-[#8a8a8a]">
          {title}
        </div>
        {options.map((o) => (
          <div
            key={o.key}
            onClick={() => onToggle(o.key)}
            className="flex h-[34px] cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-[#141414] hover:bg-[#f7f7f7]"
          >
            <span
              className="box-border flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[11px] font-bold text-[#141414]"
              style={{
                border: `1.5px solid ${o.on ? "#cbe71e" : "#c4c4c4"}`,
                background: o.on ? "#cbe71e" : "#fff"
              }}
            >
              {o.on ? "✓" : ""}
            </span>
            {o.dot && (
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: o.dot }} />
            )}
            <span className="flex-1 truncate">{o.label}</span>
            <span className="text-[11.5px] tabular-nums text-[#8a8a8a]">{o.n}</span>
          </div>
        ))}
      </div>
      <div className="my-1 h-px bg-[#ececec]" />
      <button
        type="button"
        onClick={onClear}
        className="h-8 cursor-pointer rounded-lg border-0 bg-transparent px-2.5 text-left text-[12.5px] font-semibold text-[#4a4a4a] hover:bg-[#f7f7f7]"
      >
        Limpiar
      </button>
    </div>
  </>
);

/** Vista angosta (< 820px): una tarjeta por cliente con chips de orden arriba. */
const CardList = ({
  rows,
  onOpen,
  portfolioBar,
  focus,
  loading,
  sentinelRef,
  footer
}: {
  rows: IClientsHomeRow[];
  onOpen: (row: IClientsHomeRow) => void;
  portfolioBar: (row: IClientsHomeRow, height: number) => React.ReactNode;
  focus: ClientsHomeAgingBucket | null;
  loading: boolean;
  sentinelRef: (node?: Element | null) => void;
  footer: React.ReactNode;
}) => {
  const [sortBy, sortDir, sortByColumn] = useClientsHomeFilters(
    useShallow((s) => [s.sortBy, s.sortDir, s.sortByColumn] as const)
  );
  const chips: [string, ClientsHomeSortColumn][] = [
    ["Cartera", "portfolio"],
    ["Vencida", "pastDue"],
    ["% Venc.", "pastDuePct"],
    ["Recaudo", "collectedPct"],
    ["Forecast", "forecastPct"],
    ["Nombre", "name"]
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-wrap gap-2 overflow-hidden border-b border-[#ececec] px-1 pb-2.5 pt-1.5">
        {chips.map(([label, key]) => (
          <button
            key={key}
            type="button"
            onClick={() => sortByColumn(key)}
            className="flex h-7 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg bg-white px-2.5 text-xs font-semibold text-[#141414]"
            style={{ border: `1px solid ${sortBy === key ? "#141414" : "#e3e3e3"}` }}
          >
            {label}
            <span className="text-[9px] text-[#8a8a8a]">
              {sortBy === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </span>
          </button>
        ))}
      </div>
      {rows.map((row) => {
        const pill = pastDuePill(row.pastDuePct);
        const s = forecastStyle(row.collection.forecastPct);
        return (
          <div
            key={row.clientId}
            onClick={() => onOpen(row)}
            className="flex min-w-0 cursor-pointer flex-col gap-2 border-b border-[#f0f0f0] px-1.5 py-3 hover:bg-[#fafafa]"
          >
            <div className="flex min-w-0 items-baseline justify-between gap-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="min-w-0 truncate text-[13px] font-medium text-[#1677ff]">
                  {row.clientName}
                </span>
                <span className="truncate text-[10px] text-[#9a9a9a]">
                  {row.executive.name ?? "Sin ejecutivo"} · {row.market.name ?? "Sin mercado"}
                </span>
              </div>
              <span className="whitespace-nowrap text-[13.5px] font-semibold tabular-nums">
                {fmt(focus ? row.aging[focus] : row.portfolio)}
              </span>
            </div>
            {portfolioBar(row, 5)}
            <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 text-xs tabular-nums">
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[#6b6b6b]">
                Vencida
                <span
                  className="rounded-md px-1.5 py-px text-[11px] font-semibold"
                  style={{ background: pill.bg, color: pill.color }}
                >
                  {pct1(row.pastDuePct)}
                </span>
                <span className="text-[#141414]">{fmt(row.pastDue)}</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[#6b6b6b]">
                Recaudo
                <b className="font-semibold text-[#141414]">{fmt(row.collection.collected)}</b>
                {pctInt(row.collection.collectedPct)}
              </span>
              <span
                className="flex items-center gap-1.5 whitespace-nowrap font-medium"
                style={{ color: s.color }}
              >
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: s.dot }} />
                {pctInt(row.collection.forecastPct)}
              </span>
            </div>
          </div>
        );
      })}
      {footer}
      <div ref={sentinelRef} className="h-px" />
      {loading && <Loading />}
    </div>
  );
};
