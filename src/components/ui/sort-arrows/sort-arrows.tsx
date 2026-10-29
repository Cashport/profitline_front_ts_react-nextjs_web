/* Ícono de orden de las tablas (el de Clientes, docs/DESIGN.md §7): dos triángulos de 7×4px
   apilados; gris #c4c4c4 y el de la dirección activa en #141414. */

interface SortArrowsProps {
  /** Dirección activa; sin ella los dos van en gris. */
  dir?: "asc" | "desc" | null;
}

const OFF = "#c4c4c4";

export default function SortArrows({ dir }: SortArrowsProps) {
  return (
    <span className="ml-0.5 inline-flex shrink-0 flex-col gap-px align-middle" aria-hidden>
      <span
        className="h-0 w-0 border-x-[3.5px] border-b-4 border-x-transparent"
        style={{ borderBottomColor: dir === "asc" ? "rgb(var(--cp-ink))" : OFF }}
      />
      <span
        className="h-0 w-0 border-x-[3.5px] border-t-4 border-x-transparent"
        style={{ borderTopColor: dir === "desc" ? "rgb(var(--cp-ink))" : OFF }}
      />
    </span>
  );
}
