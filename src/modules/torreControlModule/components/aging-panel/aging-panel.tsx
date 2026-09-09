"use client";

import PanelCard from "@/components/ui/panel-card/panel-card";
import DetailTooltip, { estadoRows } from "@/modules/walletModule/components/shared/detail-tooltip";
import StatusLegend from "@/modules/walletModule/components/shared/status-legend";
import { EST_META, ORDEN_EST, TRAMOS } from "@/modules/walletModule/constants";
import { fmtM, pct } from "@/modules/walletModule/utils/format";
import { cn } from "@/utils/utils";
import type { TramoIndex, WalletSegments } from "@/modules/walletModule/types";
import type { ITorreResumen } from "../../types";

interface AgingPanelProps {
  /** Desglose de cada tramo. Llega SIN el filtro de tramo aplicado, a propósito:
   *  si el gráfico se filtrara a sí mismo, elegir un tramo borraría los otros
   *  cinco y no quedaría nada sobre lo que volver a hacer clic. */
  porTramo: WalletSegments[];
  /** Resumen del mismo ámbito que `porTramo`: alimenta el pie y los porcentajes. */
  resumen: ITorreResumen;
  seleccion: TramoIndex[];
  onToggle: (tramo: TramoIndex) => void;
}

/** Rayado de "Corriente": todavía no debe nada, no es cartera en riesgo.
 *  Se dibuja con el color de texto a baja opacidad, no con --muted / --border:
 *  en oscuro esos dos tokens valen lo mismo y el rayado desaparecería. */
const HATCH = {
  backgroundImage:
    "repeating-linear-gradient(135deg, transparent 0 6px, rgb(var(--foreground) / 0.07) 6px 12px)"
};

/** Cartera por tramo de mora. Cada columna filtra el resto de la torre. */
export default function AgingPanel({ porTramo, resumen, seleccion, onToggle }: AgingPanelProps) {
  const max = Math.max(1, ...porTramo.map((g) => g.total));
  const { segments, tramos } = resumen;
  const masDe60 = tramos[3] + tramos[4] + tramos[5];

  const hint =
    seleccion.length === 0
      ? "clic en un tramo para filtrar el tablero"
      : `${seleccion.length} ${seleccion.length === 1 ? "tramo filtrando" : "tramos filtrando"} el tablero`;

  return (
    <PanelCard title="Cartera por tramo de mora" hint={hint}>
      <div className="mb-3">
        <StatusLegend />
      </div>

      <div className="flex min-h-[214px] flex-1 items-stretch gap-2.5">
        {porTramo.map((g, i) => {
          const activa = seleccion.includes(i as TramoIndex);
          const apagada = seleccion.length > 0 && !activa;

          return (
            <DetailTooltip
              key={TRAMOS[i].id}
              title={TRAMOS[i].label}
              rows={estadoRows(g)}
              total={{ value: fmtM(g.total) }}
            >
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => onToggle(i as TramoIndex)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-1.5 transition-opacity",
                  apagada && "opacity-40 hover:opacity-70"
                )}
              >
                <span
                  className={cn(
                    "text-center text-[11.5px] font-bold tabular-nums",
                    activa ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {g.total ? fmtM(g.total) : "—"}
                </span>

                <div
                  style={i === 0 ? HATCH : undefined}
                  className={cn(
                    "flex min-h-0 flex-1 items-end overflow-hidden rounded-md border bg-muted/50",
                    // Verde sólo en el borde: el lima de relleno no deja leer la barra.
                    activa ? "border-wallet-accent ring-1 ring-wallet-accent" : "border-border"
                  )}
                >
                  <div
                    className="flex w-full min-h-[3px] flex-col-reverse overflow-hidden rounded-[3px]"
                    style={{ height: `${((g.total / max) * 100).toFixed(2)}%` }}
                  >
                    {ORDEN_EST.map((e) =>
                      g[e] ? (
                        <i
                          key={e}
                          className={cn("block w-full min-h-[2px]", EST_META[e].bg)}
                          style={{
                            height: `${((g[e] / g.total) * 100).toFixed(2)}%`,
                            boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
                          }}
                        />
                      ) : null
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    "truncate text-center text-[10.5px] tracking-[0.02em]",
                    activa ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {TRAMOS[i].short}
                </span>
                <span className="-mt-1 text-center text-[10px] text-muted-foreground">
                  {segments.total ? `${pct(g.total, segments.total).toFixed(0)}%` : "—"}
                </span>
              </button>
            </DetailTooltip>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-[18px] gap-y-1 border-t border-border pt-3 text-[11.5px] text-muted-foreground">
        <span>
          Corriente{" "}
          <b className="ml-1 font-semibold tabular-nums text-foreground">{fmtM(tramos[0])}</b>
        </span>
        <span>
          Vencido{" "}
          <b className="ml-1 font-semibold tabular-nums text-foreground">
            {fmtM(segments.vencido)}
          </b>
          <small className="ml-1.5">
            {segments.total ? `${pct(segments.vencido, segments.total).toFixed(1)}%` : "—"}
          </small>
        </span>
        <span>
          Más de 60 días{" "}
          <b className="ml-1 font-semibold tabular-nums text-foreground">{fmtM(masDe60)}</b>
        </span>
        <span>
          Sin conciliar{" "}
          <b className="ml-1 font-semibold tabular-nums text-foreground">
            {fmtM(resumen.vencidos.sin_conciliar)}
          </b>
        </span>
      </div>
    </PanelCard>
  );
}
