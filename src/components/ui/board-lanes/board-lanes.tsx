"use client";

export interface BoardLane<T> {
  id: string;
  title: string;
  items: T[];
  /** Ya formateado, igual que KpiCardItem.valor. */
  total?: string;
  /** Conteo real de la columna cuando `items` es solo la primera página. */
  count?: number;
  /** Punto de color junto al título (p. ej. el color del estado). */
  color?: string;
  /** Debajo de las tarjetas (p. ej. "Ver más"). */
  footer?: React.ReactNode;
}

interface BoardLanesProps<T> {
  lanes: BoardLane<T>[];
  /** La tarjeta la pone quien usa el tablero; la columna siempre es la misma. */
  renderCard: (item: T) => React.ReactNode;
  emptyLabel?: string;
}

export default function BoardLanes<T>({
  lanes,
  renderCard,
  emptyLabel = "Vacío"
}: BoardLanesProps<T>) {
  return (
    <div className="grid auto-cols-[minmax(238px,1fr)] grid-flow-col items-start gap-3 overflow-x-auto pb-1.5">
      {lanes.map((lane) => (
        <div
          key={lane.id}
          className="flex min-h-[120px] flex-col rounded-[var(--card-radius)] border border-border bg-muted/40"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            {lane.color && (
              <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: lane.color }} />
            )}
            <h4 className="text-[13px] font-semibold text-foreground">{lane.title}</h4>
            <span className="ml-auto text-[13px] tabular-nums text-muted-foreground">
              {lane.count ?? lane.items.length}
              {lane.total ? ` · ${lane.total}` : ""}
            </span>
          </div>

          <div className="flex flex-col gap-2 p-2">
            {lane.items.length === 0 && !lane.footer ? (
              <div className="p-2.5 text-[13px] text-muted-foreground">{emptyLabel}</div>
            ) : (
              lane.items.map((item) => renderCard(item))
            )}
            {lane.footer}
          </div>
        </div>
      ))}
    </div>
  );
}
