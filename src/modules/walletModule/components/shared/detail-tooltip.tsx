"use client";

import { Tooltip } from "antd";

import { cn } from "@/utils/utils";
import { EST_META, ORDEN_EST, TRAMOS, TRAMO_BG } from "../../constants";
import { useWalletTheme } from "../../contexts/wallet-theme-context";
import { fmtM } from "../../utils/format";
import type { EstadoKey, WalletSegments } from "../../types";

export interface DetailRow {
  key: string;
  /** Clase de fondo del cuadrito; sin ella la fila va sin marca. */
  swatch?: string;
  label: string;
  /** Ya formateado, como en el resto de las primitivas. */
  value: string;
}

interface DetailTooltipProps {
  title: string;
  rows: DetailRow[];
  /** Pie del tooltip; `label` por defecto "Total". */
  total: { label?: string; value: string };
  /** Un único hijo del DOM: AntD le cuelga el ref y los handlers. */
  children: React.ReactElement;
}

/** Desglose por estado de un monto. Pide sólo los estados y no un WalletSegments
 *  entero para que una celda de la matriz (sin `vencido`) también encaje. */
export const estadoRows = (g: Pick<WalletSegments, EstadoKey>): DetailRow[] =>
  ORDEN_EST.filter((e) => g[e] > 0).map((e) => ({
    key: e,
    swatch: EST_META[e].bg,
    label: EST_META[e].nom,
    value: fmtM(g[e])
  }));

/** Desglose por tramo de un monto: lo que piden las barras de reparto. */
export const tramoRows = (tramos: number[]): DetailRow[] =>
  TRAMOS.filter((t) => tramos[t.i] > 0).map((t) => ({
    key: t.id,
    swatch: TRAMO_BG[t.i],
    label: t.label,
    value: fmtM(tramos[t.i])
  }));

/** Superficie del tooltip. Sale de los tokens y no del negro por defecto de AntD
 *  para que se lea igual en ambos temas y combine con el resto de la página. */
const SURFACE: React.CSSProperties = {
  background: "rgb(var(--popover))",
  border: "1px solid rgb(var(--border))",
  borderRadius: 8,
  padding: "8px 10px",
  minWidth: 170,
  boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)"
};

/**
 * Pone precio a los colores de una barra: título, una fila por segmento y un
 * total. El contenido vive en un portal fuera de `.wallet-scope` y del contenedor
 * `.dark`, así que el tema se re-declara aquí —`dark` en la raíz del portal y
 * `wallet-scope` en el cuerpo— igual que en GroupDetailModal. Sin eso los
 * cuadritos de color saldrían transparentes.
 */
export default function DetailTooltip({ title, rows, total, children }: DetailTooltipProps) {
  const { resolvedTheme } = useWalletTheme();

  const content = (
    <div className="wallet-scope text-[11.5px] leading-normal text-popover-foreground">
      <div className="mb-1.5 border-b border-border pb-[5px] font-bold">{title}</div>

      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-[9px_1fr_auto] items-center gap-2 py-0.5">
          {r.swatch ? (
            <i
              className={cn("block h-[9px] w-[9px] rounded-[2px]", r.swatch)}
              style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
            />
          ) : (
            <i />
          )}
          <span className="opacity-85">{r.label}</span>
          <b className="pl-3.5 font-bold tabular-nums">{r.value}</b>
        </div>
      ))}

      <div className="mt-[5px] flex justify-between gap-4 border-t border-border pt-[5px] font-bold">
        <span>{total.label ?? "Total"}</span>
        <b className="tabular-nums">{total.value}</b>
      </div>
    </div>
  );

  return (
    <Tooltip
      title={content}
      placement="top"
      // Sin flecha: se quedaría con el color por defecto de AntD, no con SURFACE.
      arrow={false}
      mouseEnterDelay={0.15}
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      overlayInnerStyle={SURFACE}
    >
      {children}
    </Tooltip>
  );
}
