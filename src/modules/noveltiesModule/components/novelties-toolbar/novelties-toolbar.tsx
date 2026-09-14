"use client";

import { fac, fmtM } from "@/modules/walletModule/utils/format";
import type { IIncidentListSummary, INoveltyStatus } from "@/types/novelties/INovelties";

interface NoveltiesToolbarProps {
  statuses: INoveltyStatus[];
  coordinators: string[];
  statusId: number | null;
  coordinator: string | null;
  onStatusChange: (id: number | null) => void;
  onCoordinatorChange: (coordinator: string | null) => void;
  /** Total del universo filtrado, no de la página. */
  totalRows: number;
  summary?: IIncidentListSummary;
}

const SELECT_CLASS =
  "h-12 cursor-pointer rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary";

/** Filtros de estado y coordinador + resumen de la vista. */
export default function NoveltiesToolbar({
  statuses,
  coordinators,
  statusId,
  coordinator,
  onStatusChange,
  onCoordinatorChange,
  totalRows,
  summary
}: NoveltiesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filtrar novedades por estado"
        value={statusId ?? ""}
        onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLASS}
      >
        <option value="">Todos los estados</option>
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.description}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar novedades por coordinador"
        value={coordinator ?? ""}
        onChange={(e) => onCoordinatorChange(e.target.value || null)}
        className={SELECT_CLASS}
      >
        <option value="">Todos los coordinadores</option>
        {coordinators.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <span className="ml-auto text-[11.5px] text-muted-foreground">
        {totalRows} novedades · {fmtM(summary?.total_amount ?? 0)} ·{" "}
        {fac(summary?.total_invoices ?? 0)} vinculadas
      </span>
    </div>
  );
}
