"use client";

import { cn } from "@/utils/utils";
import type { IWalletPerson } from "../../types";

interface PersonBadgeProps {
  person: IWalletPerson | null;
  /** Acorta a "Nombre A." y usa el avatar pequeño. */
  mini?: boolean;
  className?: string;
}

/** Avatar de iniciales + nombre. Sin persona muestra el estado "sin dueño". */
export default function PersonBadge({ person, mini, className }: PersonBadgeProps) {
  if (!person) {
    return (
      <span className={cn("font-semibold text-rose-600 dark:text-rose-400", className)}>
        {mini ? "Sin dueño" : "Sin responsable"}
      </span>
    );
  }

  const [nombre, apellido] = person.nombre.split(" ");
  const label = mini ? `${nombre}${apellido ? ` ${apellido[0]}.` : ""}` : person.nombre;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}
      title={person.nombre}
    >
      <span
        className={cn(
          "inline-grid shrink-0 place-items-center rounded-full border border-border bg-muted font-bold text-muted-foreground",
          mini ? "h-[17px] w-[17px] text-[8px]" : "h-[21px] w-[21px] text-[9.5px]"
        )}
      >
        {person.iniciales}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}
