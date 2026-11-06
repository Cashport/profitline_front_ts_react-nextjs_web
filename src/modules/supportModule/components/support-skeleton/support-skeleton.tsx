import { cn } from "@/utils/utils";

/** Carga discreta (barras grises), en lugar del logo animado dentro de tarjetas. */
export default function SupportSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 py-2", className)} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-md bg-cp-muted"
          style={{ width: `${[72, 100, 86, 64, 92][i % 5]}%` }}
        />
      ))}
    </div>
  );
}
