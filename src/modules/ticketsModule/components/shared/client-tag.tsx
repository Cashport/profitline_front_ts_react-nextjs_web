"use client";

import { cn } from "@/utils/utils";
import { corto } from "@/modules/walletModule/utils/format";

interface ClientTagProps {
  id: string;
  name: string;
  /** Pill más compacta, para tarjetas del tablero. */
  mini?: boolean;
  className?: string;
}

/** Paleta fija: mismo cliente (por id), siempre el mismo color. */
const PALETTE = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400"
];

const colorDe = (id: string): string => {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};

/** Tag de color del cliente, como los de un tablero tipo ClickUp. */
export default function ClientTag({ id, name, mini, className }: ClientTagProps) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex max-w-full items-center whitespace-nowrap rounded-full font-semibold",
        mini ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        colorDe(id),
        className
      )}
    >
      <span className="truncate">{corto(name)}</span>
    </span>
  );
}
