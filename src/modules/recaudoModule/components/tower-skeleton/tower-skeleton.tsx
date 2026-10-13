/**
 * Bloque gris con pulso, como los skeletons de la cartera. `aria-hidden`: el
 * estado de carga lo comunica el contenedor con `aria-busy`.
 */
const Bar = ({ className = "" }: { className?: string }) => (
  <span aria-hidden className={`block animate-pulse rounded bg-secondary ${className}`} />
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col rounded-xl bg-card p-4 shadow-sm">{children}</div>
);

/** Tarjeta de tabla a todo el ancho: título, línea de leyenda o chips y el cuerpo. */
const WideCard = ({ bodyClassName }: { bodyClassName: string }) => (
  <Card>
    <Bar className="h-4 w-56" />
    <Bar className="mt-4 h-3 w-72 max-w-full" />
    <Bar className={`mt-4 w-full ${bodyClassName}`} />
  </Card>
);

/**
 * Carga de la torre (la primera y al cambiar filtros): la misma rejilla y
 * casi la misma altura que el tablero, para que ni salte al llegar los datos
 * ni se pierda el scroll si el filtro se eligió más abajo.
 */
export default function TowerSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-busy aria-label="Cargando la torre de control">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 min-[1180px]:grid-cols-[minmax(0,2.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)]">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <Bar className="h-3 w-24" />
            <Bar className="mt-3 h-8 w-40" />
            <Bar className="mt-3 h-2.5 w-full" />
            <Bar className="mt-3 h-3 w-56 max-w-full" />
          </Card>
        ))}
      </div>
      {[0, 1].map((row) => (
        <div
          key={row}
          className="grid grid-cols-1 gap-3.5 min-[1180px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          {[0, 1].map((i) => (
            <Card key={i}>
              <Bar className="h-4 w-44" />
              <Bar className="mt-4 h-[428px] w-full" />
            </Card>
          ))}
        </div>
      ))}
      {/* Ejecutivos y PNA: el mismo alto de sus tablas. */}
      <WideCard bodyClassName="h-[min(653px,calc((100vh_-_150px)_*_0.8))] min-h-[300px]" />
      <WideCard bodyClassName="h-[min(560px,calc(100vh_-_150px))]" />
    </div>
  );
}
