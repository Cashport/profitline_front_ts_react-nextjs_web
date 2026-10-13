"use client";

export interface BoardLane<T> {
  id: string;
  title: string;
  items: T[];
  /** Ya formateado, igual que KpiCardItem.valor. */
  total: string;
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
          className="flex min-h-[120px] flex-col rounded-xl border border-border bg-muted/40"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <h4 className="text-xs font-semibold text-foreground">{lane.title}</h4>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
              {lane.items.length} · {lane.total}
            </span>
          </div>

          <div className="flex flex-col gap-2 p-2">
            {lane.items.length === 0 ? (
              <div className="p-2.5 text-[11.5px] text-muted-foreground">{emptyLabel}</div>
            ) : (
              lane.items.map((item) => renderCard(item))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
