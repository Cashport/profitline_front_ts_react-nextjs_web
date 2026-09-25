import { TRAMOS } from "../../constants";

/**
 * Bloque gris con pulso. Es el ladrillo de todos los skeletons de la pantalla.
 *
 * `aria-hidden` porque no aporta nada a un lector de pantalla: el estado de
 * carga lo comunica el contenedor con `aria-busy`.
 */
const Bar = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={`block animate-pulse rounded bg-secondary ${className}`}
  />
);

/** Las cuatro tarjetas de resumen. */
export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col rounded-xl bg-card p-4 shadow-sm">
          <Bar className="h-3 w-24" />
          <Bar className="mt-2.5 h-7 w-32" />
          <Bar className="mt-2.5 h-1.5 w-full" />
          <Bar className="mt-4 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}

/**
 * Matriz cliente × tramo.
 *
 * Reproduce la misma rejilla y los mismos espaciados que `ControlMatrix`
 * (una columna de cliente + los seis tramos + total + % vencido) para que al
 * llegar los datos la tabla no salte de tamaño.
 */
export function MatrixSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <section className="rounded-xl bg-card shadow-sm" aria-busy aria-label="Cargando matriz de cartera">
      <div className="flex flex-wrap items-start gap-3 border-b border-border p-4">
        <div>
          <Bar className="h-4 w-36" />
          <Bar className="mt-3 h-3 w-72" />
        </div>
        <div className="ml-auto w-full max-w-[400px]">
          <Bar className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="min-w-[250px] px-3 py-2.5 text-left">
                <Bar className="h-3 w-16" />
              </th>
              {TRAMOS.map((t) => (
                <th key={t.id} className="px-3 py-2.5">
                  <Bar className="ml-auto h-3 w-14" />
                </th>
              ))}
              <th className="px-3 py-2.5">
                <Bar className="ml-auto h-3 w-12" />
              </th>
              <th className="px-3 py-2.5">
                <Bar className="ml-auto h-3 w-16" />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="min-w-[250px] px-3 py-2.5">
                  <Bar className="h-3.5 w-48" />
                  <Bar className="mt-1.5 h-2.5 w-36" />
                </td>
                {TRAMOS.map((t) => (
                  <td key={t.id} className="px-3 py-2.5">
                    <Bar className="ml-auto h-3.5 w-16" />
                    {/* La barra de estados vive bajo cada monto. */}
                    <Bar className="mt-1.5 h-[5px] w-full" />
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <Bar className="ml-auto h-3.5 w-20" />
                </td>
                <td className="px-3 py-2.5">
                  <Bar className="ml-auto h-3.5 w-10" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Tabla inferior de grupos de facturas. */
export function GroupsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <section className="rounded-xl bg-card shadow-sm" aria-busy aria-label="Cargando grupos de facturas">
      <div className="border-b border-border p-4">
        <Bar className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-3 py-3">
            <Bar className="h-3.5 w-40" />
            <Bar className="h-3.5 w-48" />
            <Bar className="ml-auto h-3.5 w-24" />
            <Bar className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}
