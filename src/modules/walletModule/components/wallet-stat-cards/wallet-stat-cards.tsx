"use client";

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

  const cards: {
    key: string;
    label: React.ReactNode;
    value: string;
    foot: string;
    bar?: React.ReactNode;
  }[] = [
    {
      key: "saldo",
      label: "Cartera",
      value: fmtM(g.total),
      foot: `${fac(g.n)} · ${cli(summary.clientes)}`,
      bar: <SegBar segments={g} className="mt-2.5 h-1.5" />
    },
    {
      key: "vencida",
      label: "Cartera vencida",
      value: fmtM(g.vencido),
      foot: `${pct(g.vencido, g.total).toFixed(0)}% de la cartera`
    },
    {
      key: "novedad",
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
      key: "sin-conciliar",
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

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.key} className="flex flex-col rounded-lg bg-muted p-3.5">
          <div className="flex items-center gap-1.5 text-[13px] text-foreground">{c.label}</div>
          <div className="mt-1.5 text-[22px] font-medium leading-none tabular-nums text-foreground">
            {c.value}
          </div>
          {c.bar}
          <div className="mt-auto pt-2 text-[12px] text-muted-foreground">{c.foot}</div>
        </div>
      ))}
    </div>
  );
}
