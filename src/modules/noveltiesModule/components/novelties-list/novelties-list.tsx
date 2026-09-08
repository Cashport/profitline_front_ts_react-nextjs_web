"use client";

import { useMemo, useState } from "react";

import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { corto, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { nextSort, ordenar } from "@/modules/walletModule/utils/wallet-calc";
import type { SortState } from "@/modules/walletModule/types";
import { ESTADO_BY_ID, TIPO_BY_ID } from "../../constants";
import { sevGestion, sevLimite, slaDe, valorDeColumna } from "../../utils/novelties-calc";
import type { INoveltyRow } from "../../types";

interface NoveltiesListProps {
  rows: INoveltyRow[];
  onOpenDetail: (id: string) => void;
}

const TEXTUAL_COLS = ["novedad", "cliente", "resp", "estado", "ticket", "limite"];

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
const GestionChip = ({ dias }: { dias: number | null }) => {
  if (dias === null) return <span className="text-muted-foreground">—</span>;
  return <StatusChip sev={sevGestion(dias)}>{dias === 0 ? "Hoy" : `${dias}d`}</StatusChip>;
};

/** Vista "Lista": la bandeja como tabla ordenable. */
export default function NoveltiesList({ rows, onOpenDetail }: NoveltiesListProps) {
  const [sort, setSort] = useState<SortState>({ col: "ticket", dir: "asc" });

  const visibleRows = useMemo(
    () => ordenar(rows, sort, (n) => valorDeColumna(n, sort.col)),
    [rows, sort]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="novedad" label="Novedad" sort={sort} onSort={onSort} />
              <SortableTh col="cliente" label="Cliente" sort={sort} onSort={onSort} />
              <SortableTh col="fact" label="Fact." align="right" sort={sort} onSort={onSort} />
              <SortableTh col="monto" label="Monto" align="right" sort={sort} onSort={onSort} />
              <SortableTh col="resp" label="Responsable" sort={sort} onSort={onSort} />
              <SortableTh
                col="gestion"
                label="Últ. gestión"
                align="right"
                sort={sort}
                onSort={onSort}
              />
              <SortableTh col="ticket" label="Próx. ticket" sort={sort} onSort={onSort} />
              <SortableTh col="limite" label="Límite" sort={sort} onSort={onSort} />
              <SortableTh col="estado" label="Estado" sort={sort} onSort={onSort} />
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-9 text-center text-muted-foreground">
                  No hay novedades con estos filtros.
                </td>
              </tr>
            ) : (
              visibleRows.map((n) => {
                const sla = slaDe(n);
                const estado = ESTADO_BY_ID[n.estado];

                return (
                  <tr
                    key={n.id}
                    onClick={() => onOpenDetail(n.id)}
                    className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-semibold text-foreground">{n.id}</span>
                      <div className="text-[11.5px] text-muted-foreground">
                        {TIPO_BY_ID[n.tipo].nom} · {n.accion}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-foreground">{corto(n.cliente.nombre)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {n.facturas}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmtM(n.monto)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <PersonBadge person={n.responsable} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <GestionChip dias={n.diasSinGestion} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <StatusChip sev={sla.sev}>{fmtD(n.compromiso)}</StatusChip>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <StatusChip sev={sevLimite(n.limite)}>{fmtD(n.limite)}</StatusChip>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusChip sev={estado.sev}>{estado.nom}</StatusChip>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
