"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "antd";
import { ChatCenteredText, Info } from "phosphor-react";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { AGING_BUCKETS, type IClosingComment } from "@/types/closings/IClosings";
import { cn, getAppZoom } from "@/utils/utils";

import { AGING_COLORS, AGING_LABELS, HIGH_OVERDUE, marketColor } from "../../constants";
import { useTableSort } from "../../hooks/use-table-sort";
import { KIND_GROUPS, emptyBuckets, sumBy, type ClientRow } from "../../utils/aggregate";
import { formatDate, formatM1, formatPct, formatPp, periodLabel } from "../../utils/format";
import { FORM_HEALTHY, FORM_LENGTH, FORM_LOSS, formScore, type FormDot } from "../../utils/trends";
import { Pill } from "../closing-kpis/closing-kpis";
import Sparkline from "../sparkline/sparkline";

interface Column {
  key: string;
  label: string;
  width: string;
  sortValue?: (r: ClientRow) => number | string;
  align?: "left" | "right" | "center";
  help?: string;
  /** Línea a la izquierda: separa el bloque de recaudo del de cartera. */
  divider?: boolean;
}

interface Props {
  rows: ClientRow[];
  /** Comentarios del cierre elegido, por NIT. */
  comments: Map<string, IClosingComment[]>;
  /** Racha de los últimos cierres por NIT. */
  form?: Map<string, FormDot[]>;
  /** Recaudo de cada cliente en los últimos cierres (minigráfica). */
  collectedTrend?: Map<string, number[]>;
  onOpen: (row: ClientRow) => void;
}

const NO_FORM = new Map<string, FormDot[]>();
/** Fila Total + padding inferior de la tarjeta + margen inferior de la página. */
const BOTTOM_RESERVE = 48 + 10 + 14;
const NO_TREND = new Map<string, number[]>();
/** Separador del bloque de cartera: línea gris a la izquierda, a todo el alto de la fila. */
const DIVIDER = "flex h-full items-center self-stretch border-l border-cp-line pl-3 [&>*]:w-full";

/**
 * Ícono al final de la fila: globo azul si el cliente tiene comentario en el cierre, "i" gris
 * si no. Al pasar el mouse muestra el ejecutivo y, si hay, el comentario.
 */
function ClientNote({ row, notes }: { row: ClientRow; notes?: IClosingComment[] }) {
  const has = Boolean(notes?.length);
  return (
    <Tooltip
      placement="left"
      color="rgb(var(--cp-surface))"
      overlayStyle={{ maxWidth: 360 }}
      overlayInnerStyle={{ padding: 0, boxShadow: "0 12px 32px rgba(0,0,0,.16)", borderRadius: 12 }}
      title={
        <div className="w-[320px] max-w-[80vw] px-3.5 py-3 text-[13px] text-cp-ink">
          <p className="truncate font-semibold">{row.client}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-cp-ink-3">
            Ejecutivo: <span className="truncate text-cp-ink">{row.executive}</span>
          </p>
          <p className="flex items-center gap-1.5 text-cp-ink-3">
            <span
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: marketColor(row.market) }}
            />
            <span className="truncate">{row.market}</span>
          </p>
          {notes?.map((n) => (
            <div key={n.id} className="mt-2 border-t border-cp-line pt-2">
              <p className="whitespace-pre-line leading-[1.5] text-cp-ink-2">{n.comment}</p>
              <p className="mt-1 text-cp-ink-4">
                {n.created_by_name || n.created_by_email} · {formatDate(n.created_at)}
              </p>
            </div>
          ))}
        </div>
      }
    >
      {has ? (
        <ChatCenteredText
          size={17}
          weight="fill"
          className="shrink-0 text-[#011722] dark:text-cp-ink"
        />
      ) : (
        <Info size={17} className="shrink-0 text-cp-ink-4" />
      )}
    </Tooltip>
  );
}
const TIP_WIDTH = 720;
const TIP_HEIGHT = 230;

type Tip = { nit: string; x: number; y: number } | null;

const tipPosition = (el: HTMLElement) => {
  const z = getAppZoom();
  const b = el.getBoundingClientRect();
  const vw = window.innerWidth / z;
  const vh = window.innerHeight / z;
  const x = Math.max(8, Math.min(b.left / z, vw - TIP_WIDTH - 8));
  const y = b.bottom / z + 8 + TIP_HEIGHT > vh ? b.top / z - TIP_HEIGHT - 8 : b.bottom / z + 8;
  return { x, y: Math.max(8, y) };
};

const amount = (v: number) => (v ? formatM1(v) : <span className="text-cp-ink-4">—</span>);

type Tone = "good" | "bad" | "flat";

/** Variación junto al valor con el semáforo de Cashport: lima mejora, magenta empeora. */
function DeltaChip({ text, tone }: { text: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-block min-w-[52px] whitespace-nowrap text-left text-[13px] font-semibold tabular-nums",
        tone === "good" && "text-[#9bb514]",
        tone === "bad" && "text-[#d11a2a] dark:text-[#ff6b6b]",
        tone === "flat" && "text-[#8a8a8a]"
      )}
    >
      {text}
    </span>
  );
}

const overdueDelta = (r: ClientRow) => {
  if (r.prevOverduePct === null) return null;
  const diff = r.overduePct - r.prevOverduePct;
  if (Math.abs(diff) < 0.001) return <DeltaChip text="=" tone="flat" />;
  return (
    <DeltaChip
      text={`${diff > 0 ? "▲" : "▼"} ${formatPp(Math.abs(diff)).replace("+", "").replace(" pp", "")}`}
      tone={diff > 0 ? "bad" : "good"}
    />
  );
};

const collectedDelta = (r: ClientRow) => {
  if (r.prevCollected === null) return null;
  if (!r.prevCollected) return r.collected ? <DeltaChip text="Nuevo" tone="good" /> : null;
  const diff = (r.collected - r.prevCollected) / r.prevCollected;
  if (Math.abs(diff) < 0.0005) return <DeltaChip text="=" tone="flat" />;
  const pct = Math.abs(diff) >= 10 ? ">999" : formatPct(Math.abs(diff)).replace(" %", "");
  return <DeltaChip text={`${diff > 0 ? "▲" : "▼"} ${pct}%`} tone={diff > 0 ? "good" : "bad"} />;
};

/** Una bolita de la racha: ✓ bien, – empeoró un poco, ✗ empeoró; la última va más grande. */
function FormBall({ dot, last }: { dot: FormDot; last: boolean }) {
  const size = last ? 16 : 13;
  const style =
    dot.result === "win"
      ? { bg: "#9bb514", fg: "#fff" }
      : dot.result === "loss"
        ? { bg: "#d11a2a", fg: "#fff" }
        : dot.result === "draw"
          ? { bg: "#c4c4c4", fg: "#fff" }
          : { bg: "rgb(var(--cp-muted))", fg: "rgb(var(--cp-muted))" };
  const title =
    dot.overduePct === null
      ? `${periodLabel(dot.period)}: sin cartera`
      : `${periodLabel(dot.period)}: ${formatPct(dot.overduePct)} vencido${
          dot.change === null ? "" : ` (${formatPp(dot.change)})`
        }${
          dot.result === "win"
            ? dot.overduePct <= FORM_HEALTHY
              ? " · sano"
              : " · bien"
            : dot.result === "loss"
              ? " · empeoró"
              : dot.result === "draw"
                ? " · empeoró un poco"
                : ""
        }`;
  return (
    <Tooltip title={title}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: style.bg,
          boxShadow: last ? `0 0 0 2px rgb(var(--cp-surface)), 0 0 0 3px ${style.bg}` : undefined
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" aria-hidden>
          {dot.result === "win" && (
            <path
              d="M2.5 6.2l2.3 2.3 4.7-5"
              fill="none"
              stroke={style.fg}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {dot.result === "loss" && (
            <path
              d="M3 3l6 6M9 3l-6 6"
              fill="none"
              stroke={style.fg}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
          {dot.result === "draw" && (
            <path d="M3 6h6" fill="none" stroke={style.fg} strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </span>
    </Tooltip>
  );
}

/** Tooltip de la celda Cartera: Facturas, Saldos, Notas y Otros por tramo, como en Clientes. */
function BreakdownTooltip({ row }: { row: ClientRow }) {
  const groups = [
    ...KIND_GROUPS.filter((g) => g !== "Otros" || AGING_BUCKETS.some((b) => row.byKind[g][b])).map(
      (g) => ({
        label: g,
        values: row.byKind[g],
        total: false
      })
    ),
    { label: "Total", values: row.buckets, total: true }
  ];
  return (
    <div className="box-border flex w-[720px] max-w-[calc(100*var(--vw)-16px)] flex-col gap-2 rounded-xl bg-[#141414] px-3.5 py-3 text-[13px] text-white shadow-[0_12px_32px_rgba(0,0,0,.22)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-[#2e2e2e] pb-2">
        <span className="truncate font-semibold">{row.client}</span>
        <span className="shrink-0 text-[#bdbdbd]">Millones</span>
      </div>
      <div
        className="grid items-center gap-x-2.5 gap-y-[7px] tabular-nums"
        style={{ gridTemplateColumns: `62px repeat(${AGING_BUCKETS.length + 1}, minmax(0,1fr))` }}
      >
        <span />
        {AGING_BUCKETS.map((b) => (
          <span
            key={b}
            className="flex items-center justify-end gap-[5px] whitespace-nowrap text-[#bdbdbd]"
          >
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: AGING_COLORS[b] }} />
            {AGING_LABELS[b]}
          </span>
        ))}
        <span className="text-right font-semibold">Total</span>
        {groups.map((g) => {
          const border = g.total ? "#5a5a5a" : "#2e2e2e";
          const cell = (v: number, key: string) => (
            <span
              key={key}
              className="whitespace-nowrap pt-[7px] text-right"
              style={{
                borderTop: `1px solid ${border}`,
                fontWeight: g.total ? 600 : 500,
                color: v < 0 ? "#ff9a7a" : v ? "#fff" : "#6b6b6b"
              }}
            >
              {formatM1(v)}
            </span>
          );
          return [
            <span
              key={`${g.label}-label`}
              className="whitespace-nowrap pt-[7px]"
              style={{
                borderTop: `1px solid ${border}`,
                color: g.total ? "#fff" : "#bdbdbd",
                fontWeight: g.total ? 600 : 400
              }}
            >
              {g.label}
            </span>,
            ...AGING_BUCKETS.map((b) => cell(g.values[b], `${g.label}-${b}`)),
            cell(
              AGING_BUCKETS.reduce((acc, b) => acc + g.values[b], 0),
              `${g.label}-total`
            )
          ];
        })}
      </div>
    </div>
  );
}

/**
 * "Resultados del cierre por cliente": una fila por cliente, compacta como una pizarra de
 * cotizaciones. Variaciones en chips de color y la racha de los últimos cierres en bolitas.
 */
export default function ClientsTable({
  rows,
  comments,
  form = NO_FORM,
  collectedTrend = NO_TREND,
  onOpen
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1400);
  const [expanded, setExpanded] = useState(false);
  const [tip, setTip] = useState<Tip>(null);
  const narrow = width < 700;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);

  // El cuerpo llega hasta el borde de abajo de la pantalla: se mide desde donde empieza y se
  // resta la fila Total y el aire de la tarjeta (en px CSS, compensando el zoom global).
  useEffect(() => {
    if (narrow) return;
    const update = () => {
      const el = bodyRef.current;
      if (!el) return;
      const z = getAppZoom();
      const top = el.getBoundingClientRect().top / z;
      const viewport = window.innerHeight / z;
      setBodyHeight(Math.max(240, viewport - top - BOTTOM_RESERVE));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [narrow, rows.length]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [narrow]);

  const extra = expanded ? 560 : 0;
  const showBalances = width >= 1200 + extra;
  const showAging = width >= 980 + extra;
  const showVencida = width >= 900 + extra;
  const formLength = Math.max(...Array.from(form.values()).map((d) => d.length), 0);

  const columns = useMemo<Column[]>(
    () => [
      {
        key: "client",
        label: "Cliente",
        width: "minmax(170px,1.7fr)",
        sortValue: (r) => r.client,
        align: "left"
      },
      {
        key: "collected",
        label: "Recaudo",
        width: "minmax(92px,.7fr)",
        sortValue: (r) => r.collected,
        help: "Recaudo del mes y, al lado, su variación frente al cierre anterior."
      },
      {
        key: "collectedTrend",
        label: "Evolución",
        width: "96px",
        align: "center",
        help: "Recaudo del cliente en los últimos cierres; la línea punteada es su promedio. Verde si el último cierre quedó por encima del promedio, rojo si quedó por debajo, gris si está a ±2 %."
      },
      { key: "collectedDelta", label: "", width: "68px", align: "left" },
      ...(showAging
        ? [
            {
              key: "aging",
              label: "Tramos",
              width: "minmax(110px,.9fr)",
              align: "left" as const,
              divider: true
            }
          ]
        : []),
      {
        key: "total",
        label: "Cartera",
        width: "minmax(104px,.75fr)",
        sortValue: (r) => r.total,
        divider: !showAging
      },
      ...(expanded
        ? AGING_BUCKETS.map<Column>((b) => ({
            key: `ag-${b}`,
            label: AGING_LABELS[b],
            width: "minmax(74px,.6fr)",
            sortValue: (r) => r.buckets[b]
          }))
        : []),
      ...(showVencida
        ? [
            {
              key: "overdue",
              label: "Vencida",
              width: "minmax(86px,.7fr)",
              sortValue: (r: ClientRow) => r.overdue
            }
          ]
        : []),
      {
        key: "overduePct",
        label: "% Venc.",
        width: "78px",
        sortValue: (r) => r.overduePct,
        help: "% vencido del cierre y, al lado, el cambio en puntos frente al cierre anterior."
      },
      { key: "overdueDelta", label: "", width: "56px", align: "left" },
      ...(showBalances
        ? [
            {
              key: "openBalances",
              label: "Saldos",
              width: "minmax(80px,.6fr)",
              sortValue: (r: ClientRow) => r.openBalances
            },
            {
              key: "notes",
              label: "Notas",
              width: "minmax(80px,.6fr)",
              sortValue: (r: ClientRow) => r.notes
            }
          ]
        : []),
      // Con las edades abiertas la fila crece: la racha se oculta para que el comentario quepa.
      ...(expanded
        ? []
        : [
            {
              key: "form",
              label: `Últimos ${formLength || FORM_LENGTH}`,
              width: `${Math.max(formLength, 1) * 17 + 12}px`,
              sortValue: (r: ClientRow) => formScore(form.get(r.nit)),
              align: "center" as const,
              help: `Cada bolita es un cierre, el más reciente a la derecha. Verde: el % vencido bajó o se mantuvo (o está en ${Math.round(FORM_HEALTHY * 100)} % o menos). Gris: subió hasta ${formatPp(FORM_LOSS).replace("+", "")}. Rojo: subió más de ${formatPp(FORM_LOSS).replace("+", "")}.`
            }
          ]),
      { key: "comment", label: "", width: "22px" }
    ],
    [expanded, showBalances, showVencida, showAging, form, formLength]
  );
  const gridCols = columns.map((c) => c.width).join(" ");

  const { sort, onSort, sorted } = useTableSort(
    rows,
    { col: "total", dir: "desc" },
    (r, col) => columns.find((c) => c.key === col)?.sortValue?.(r) ?? 0
  );

  const totals = useMemo(() => {
    const buckets = emptyBuckets();
    rows.forEach((r) => AGING_BUCKETS.forEach((b) => (buckets[b] += r.buckets[b])));
    const total = sumBy(rows, (r) => r.total);
    const overdue = total - buckets.Corriente;
    return {
      total,
      buckets,
      overdue,
      overduePct: total ? overdue / total : 0,
      collected: sumBy(rows, (r) => r.collected),
      openBalances: sumBy(rows, (r) => r.openBalances),
      notes: sumBy(rows, (r) => r.notes)
    };
  }, [rows]);

  const tipRow = tip ? rows.find((r) => r.nit === tip.nit) : undefined;
  const num = "whitespace-nowrap text-right text-[13px] tabular-nums";

  const cell = (column: Column, r: ClientRow) => {
    switch (column.key) {
      case "client":
        return (
          <span className="flex min-w-0 items-center gap-2" title={`${r.client} · ${r.executive}`}>
            <span
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: marketColor(r.market) }}
            />
            <span className="truncate text-[13px] font-medium text-cp-blue hover:underline">
              {r.client}
            </span>
          </span>
        );
      case "total":
        return (
          <div
            onMouseEnter={(e) => setTip({ nit: r.nit, ...tipPosition(e.currentTarget) })}
            onMouseLeave={() => setTip(null)}
            className={cn(num, "font-semibold")}
          >
            {formatM1(r.total)}
          </div>
        );
      case "aging":
        return (
          <div
            onMouseEnter={(e) => setTip({ nit: r.nit, ...tipPosition(e.currentTarget) })}
            onMouseLeave={() => setTip(null)}
            className="py-1"
          >
            <AgingBar
              height={8}
              gap={1}
              segments={AGING_BUCKETS.map((b) => ({
                key: b,
                value: r.buckets[b],
                color: AGING_COLORS[b]
              }))}
            />
          </div>
        );
      case "overdue":
        return <div className={num}>{amount(r.overdue)}</div>;
      case "overduePct":
        return (
          <div className="flex justify-end">
            <Pill tone={r.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
              {formatPct(r.overduePct).replace(" %", "%")}
            </Pill>
          </div>
        );
      case "overdueDelta":
        return overdueDelta(r);
      case "collected":
        return <div className={num}>{amount(r.collected)}</div>;
      case "collectedDelta":
        return collectedDelta(r);
      case "collectedTrend": {
        const values = collectedTrend.get(r.nit) ?? [];
        const last = values[values.length - 1] ?? 0;
        const mean = values.length ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;
        // ±2 % del promedio cuenta como igual (gris).
        const diff = mean ? (last - mean) / mean : 0;
        const color = diff > 0.02 ? "#9bb514" : diff < -0.02 ? "#d11a2a" : "#8a8a8a";
        return (
          <Tooltip
            title={`Último cierre ${formatM1(last)} M · promedio ${values.length} cierres ${formatM1(mean)} M`}
          >
            <div className="flex justify-center">
              <Sparkline
                values={values}
                color={color}
                width={80}
                height={22}
                reference={values.length > 1 ? mean : undefined}
              />
            </div>
          </Tooltip>
        );
      }
      case "form": {
        const dots = form.get(r.nit) ?? [];
        return (
          <div className="flex items-center justify-center gap-1">
            {dots.map((d, i) => (
              <FormBall key={d.period} dot={d} last={i === dots.length - 1} />
            ))}
          </div>
        );
      }
      case "openBalances":
        return <div className={num}>{amount(r.openBalances)}</div>;
      case "notes":
        return <div className={cn(num, r.notes < 0 && "text-cp-red")}>{amount(r.notes)}</div>;
      case "comment":
        return <ClientNote row={r} notes={comments.get(r.nit)} />;
      default: {
        const bucket = column.key.slice(3) as (typeof AGING_BUCKETS)[number];
        return <div className={num}>{amount(r.buckets[bucket])}</div>;
      }
    }
  };

  const totalCell = (column: Column) => {
    const bold = cn(num, "font-semibold");
    switch (column.key) {
      case "client":
        return (
          <div className="text-[13px] font-semibold">
            Total · {rows.length.toLocaleString("es-CO")} clientes
          </div>
        );
      case "total":
        return <div className={bold}>{formatM1(totals.total)}</div>;
      case "aging":
        return (
          <AgingBar
            height={8}
            gap={1}
            segments={AGING_BUCKETS.map((b) => ({
              key: b,
              value: totals.buckets[b],
              color: AGING_COLORS[b]
            }))}
          />
        );
      case "overdue":
        return <div className={bold}>{formatM1(totals.overdue)}</div>;
      case "overduePct":
        return (
          <div className="flex justify-end">
            <Pill>{formatPct(totals.overduePct).replace(" %", "%")}</Pill>
          </div>
        );
      case "collected":
        return <div className={bold}>{formatM1(totals.collected)}</div>;
      case "openBalances":
        return <div className={bold}>{formatM1(totals.openBalances)}</div>;
      case "notes":
        return <div className={bold}>{formatM1(totals.notes)}</div>;
      case "collectedTrend":
      case "collectedDelta":
      case "overdueDelta":
      case "form":
      case "comment":
        return <div />;
      default:
        return (
          <div className={bold}>
            {formatM1(totals.buckets[column.key.slice(3) as (typeof AGING_BUCKETS)[number]])}
          </div>
        );
    }
  };

  const header = (column: Column) => {
    const active = sort.col === column.key;
    const justify =
      column.align === "left" ? "flex-start" : column.align === "center" ? "center" : "flex-end";
    const content = (
      <div
        key={column.key}
        onClick={() => column.sortValue && onSort(column.key)}
        className={cn(
          "flex select-none items-center gap-1 whitespace-nowrap text-[13.5px] font-semibold text-cp-ink",
          column.sortValue && "cursor-pointer",
          column.divider && "-my-2.5 self-stretch border-l border-cp-line py-2.5 pl-3"
        )}
        style={{ justifyContent: justify }}
      >
        {column.label}
        {column.sortValue && <SortArrows dir={active ? sort.dir : null} />}
        {column.key === "total" && (
          <button
            type="button"
            title={expanded ? "Ocultar edades" : "Ver edades en columnas"}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="ml-1 flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[13px] font-semibold leading-none text-cp-ink hover:!border-cp-ink"
            style={{
              border: `1px solid ${expanded ? "rgb(var(--cp-ink))" : "rgb(var(--cp-line-2))"}`,
              background: expanded ? "rgb(var(--cp-lime) / 0.25)" : "rgb(var(--cp-surface))"
            }}
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>
    );
    return column.help ? (
      <Tooltip key={column.key} title={column.help}>
        {content}
      </Tooltip>
    ) : (
      content
    );
  };

  // Celular: una tarjeta por cliente con lo esencial (como la lista angosta de Clientes).
  if (narrow) {
    return (
      <div ref={cardRef} className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center justify-between gap-2 text-[13px] text-cp-ink-3">
          <span>{rows.length.toLocaleString("es-CO")} clientes · millones</span>
          <span>Total {formatM1(totals.total)}</span>
        </div>
        {sorted.map((r) => {
          const dots = form.get(r.nit) ?? [];
          return (
            <button
              key={r.nit}
              type="button"
              onClick={() => onOpen(r)}
              className="flex w-full flex-col gap-1.5 border-b border-cp-line py-2.5 text-left"
            >
              <span className="flex w-full min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ background: marketColor(r.market) }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-cp-blue">
                  {r.client}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <ClientNote row={r} notes={comments.get(r.nit)} />
                </span>
              </span>
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-[13px] font-semibold tabular-nums text-cp-ink">
                  {formatM1(r.total)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Pill tone={r.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                    {formatPct(r.overduePct).replace(" %", "%")}
                  </Pill>
                  {overdueDelta(r)}
                </span>
              </span>
              <AgingBar
                height={6}
                gap={1}
                segments={AGING_BUCKETS.map((b) => ({
                  key: b,
                  value: r.buckets[b],
                  color: AGING_COLORS[b]
                }))}
              />
              <span className="flex w-full items-center justify-between gap-2 text-[13px]">
                <span className="flex items-center gap-1.5 text-cp-ink-3">
                  Recaudo <span className="tabular-nums text-cp-ink">{formatM1(r.collected)}</span>
                  {collectedDelta(r)}
                </span>
                <span className="flex items-center gap-[3px]">
                  {dots.map((d, i) => (
                    <FormBall key={d.period} dot={d} last={i === dots.length - 1} />
                  ))}
                </span>
              </span>
            </button>
          );
        })}
        {rows.length === 0 && (
          <p className="py-10 text-center text-[13px] text-cp-ink-3">
            Ningún cliente coincide con los filtros.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="flex min-h-0 min-w-0 flex-col">
      <div
        ref={bodyRef}
        className="min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin]"
        style={{ height: bodyHeight ?? "calc(100 * var(--vh, 1vh) - 205px)" }}
      >
        <div
          className="sticky top-0 z-[3] grid items-center gap-x-3 border-b border-cp-line bg-cp-surface px-3 py-2.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map(header)}
        </div>
        {sorted.map((r) => (
          <div
            key={r.nit}
            onClick={() => onOpen(r)}
            className="grid h-[38px] cursor-pointer items-center gap-x-3 border-b border-cp-line px-3 hover:bg-cp-bg"
            style={{ gridTemplateColumns: gridCols }}
          >
            {columns.map((column) => (
              <div key={column.key} className={cn("min-w-0", column.divider && DIVIDER)}>
                {cell(column, r)}
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-10 text-center text-[13px] text-cp-ink-3">
            Ningún cliente coincide con los filtros.
          </p>
        )}
      </div>
      {rows.length > 0 && (
        <div
          className="grid items-center gap-x-3 overflow-hidden border-t border-cp-line-2 bg-cp-bg px-3 py-2.5 [scrollbar-gutter:stable]"
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map((column) => (
            <div key={column.key} className={cn("min-w-0", column.divider && DIVIDER)}>
              {totalCell(column)}
            </div>
          ))}
        </div>
      )}

      {tip &&
        tipRow &&
        createPortal(
          <div className="pointer-events-none fixed z-[60]" style={{ left: tip.x, top: tip.y }}>
            <BreakdownTooltip row={tipRow} />
          </div>,
          document.body
        )}
    </div>
  );
}
