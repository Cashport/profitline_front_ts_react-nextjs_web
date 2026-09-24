"use client";

import { cn } from "@/utils/utils";

interface WalletPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Números a mostrar: siempre la primera, la última y una ventana alrededor
 *  de la actual; el resto se resume en "…". */
function paginas(actual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const ventana = new Set([1, total, actual - 1, actual, actual + 1]);
  const nums = [...ventana].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - (nums[i - 1] as number) > 1) out.push("…");
    out.push(n);
  });
  return out;
}

/** Paginación con el look de la referencia: flechas, cuadros de página y "…". */
export default function WalletPagination({
  page,
  pageSize,
  total,
  onChange,
  className
}: WalletPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-end gap-3.5 text-[13px]", className)}>
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        ◀
      </button>

      {paginas(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border font-semibold transition-colors",
              p === page
                ? "border-wallet-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        ▶
      </button>
    </div>
  );
}
