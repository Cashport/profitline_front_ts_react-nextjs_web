"use client";

import StatCards, { type StatCardItem } from "@/components/ui/stat-cards/stat-cards";
import { cn } from "@/utils/utils";
import { EST_META } from "../../constants";
import { cli, fac, fmtM, pct } from "../../utils/format";
import SegBar from "../shared/seg-bar";
import type { EstadoKey, IWalletSummary } from "../../types";

interface WalletStatCardsProps {
  summary: IWalletSummary;
}

const Swatch = ({ estado }: { estado: EstadoKey }) => (
  <i
    className={cn("inline-block h-2.5 w-2.5 rounded-[2px]", EST_META[estado].bg)}
    style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
  />
);

/** Las cuatro tarjetas de resumen sobre la matriz. */
export default function WalletStatCards({ summary }: WalletStatCardsProps) {
  const g = summary.segments;
  const resuelto = g.compensada + g.pagada;

  const cards: StatCardItem[] = [
    {
      id: "saldo",
      label: "Saldo en vista",
      value: fmtM(g.total),
      foot: `${fac(g.n)} · ${cli(summary.clientes)}`,
      bar: <SegBar segments={g} className="mt-2.5 h-1.5" />
    },
    {
      id: "resuelto",
      label: (
        <>
          <Swatch estado="compensada" />
          <Swatch estado="pagada" />
          Ya resuelto
        </>
      ),
      value: fmtM(resuelto),
      foot: `Compensado ${fmtM(g.compensada)} · pagado sin depurar ${fmtM(g.pagada)}`
    },
    {
      id: "novedad",
      label: (
        <>
          <Swatch estado="novedad" />
          Con novedad abierta
        </>
      ),
      value: fmtM(g.novedad),
      foot: `${pct(g.novedad, g.total).toFixed(0)}% del saldo · en gestión`
    },
    {
      id: "sin-conciliar",
      label: (
        <>
          <Swatch estado="sin_conciliar" />
          Sin conciliar
        </>
      ),
      value: fmtM(g.sin_conciliar),
      foot: `${pct(g.sin_conciliar, g.total).toFixed(0)}% del saldo · nadie lo ha tocado`
    }
  ];

  return <StatCards cards={cards} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" />;
}
