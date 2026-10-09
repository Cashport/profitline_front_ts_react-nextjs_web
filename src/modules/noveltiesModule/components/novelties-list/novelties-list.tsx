"use client";

import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { toPerson } from "@/modules/walletModule/utils/api-adapter";
import { corto, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { IIncidentListItem } from "@/types/novelties/INovelties";
import {
  diasSinGestion,
  noveltyCode,
  sevGestion,
  sevLimite,
  slaDe
} from "../../utils/novelties-calc";

interface NoveltiesListProps {
  items: IIncidentListItem[];
  /** `col` es el `sort_by` del API: el servidor ordena, no la tabla. */
  sort: SortState;
  onSort: (col: string) => void;
  loading: boolean;
  onOpenDetail: (incidentId: number) => void;
}

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
const GestionChip = ({ dias }: { dias: number | null }) => {
  if (dias === null) return <span className="text-muted-foreground">—</span>;
  return <StatusChip sev={sevGestion(dias)}>{dias === 0 ? "Hoy" : `${dias}d`}</StatusChip>;
};

/** Vista "Lista": la bandeja como tabla ordenable. */
export default function NoveltiesList({
  items,
  sort,
  onSort,
  loading,
  onOpenDetail
}: NoveltiesListProps) {
  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className={cn("overflow-x-auto", loading && "pointer-events-none opacity-60")}>
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="id" label="Novedad" sort={sort} onSort={onSort} />
              <SortableTh col="client_name" label="Cliente" sort={sort} onSort={onSort} />
              {/* El API no ordena por número de facturas. */}
              <th
                scope="col"
                className="whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                Fact.
              </th>
              <SortableTh col="amount" label="Monto" align="right" sort={sort} onSort={onSort} />
              <SortableTh col="assigned_to_name" label="Responsable" sort={sort} onSort={onSort} />
              <SortableTh
                col="last_management_at"
                label="Últ. gestión"
                align="right"
                sort={sort}
                onSort={onSort}
              />
              <SortableTh col="next_ticket_date" label="Próx. ticket" sort={sort} onSort={onSort} />
              <SortableTh col="limit_date" label="Límite" sort={sort} onSort={onSort} />
              <SortableTh col="novelty_status" label="Estado" sort={sort} onSort={onSort} />
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-9 text-center text-muted-foreground">
                  No hay novedades con estos filtros.
                </td>
              </tr>
            ) : (
              items.map((n) => {
                const sla = slaDe(n);

                return (
                  <tr
                    key={n.incident_id}
                    onClick={() => onOpenDetail(n.incident_id)}
                    className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-semibold text-foreground">
                        {noveltyCode(n)}
                      </span>
                      <div className="text-[11.5px] text-muted-foreground">
                        {n.novelty_name}
                        {n.next_action_title && ` · ${n.next_action_title}`}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-foreground">{corto(n.client_name)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {n.invoice_count}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmtM(n.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <PersonBadge person={toPerson(n.assigned_to_name)} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <GestionChip dias={diasSinGestion(n)} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {n.next_ticket_date ? (
                        <StatusChip sev={sla.sev}>{fmtD(new Date(n.next_ticket_date))}</StatusChip>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {n.limit_date ? (
                        <StatusChip sev={sevLimite(new Date(n.limit_date))}>
                          {fmtD(new Date(n.limit_date))}
                        </StatusChip>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusChip color={n.novelty_status_color}>
                        {n.novelty_status_name}
                      </StatusChip>
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
