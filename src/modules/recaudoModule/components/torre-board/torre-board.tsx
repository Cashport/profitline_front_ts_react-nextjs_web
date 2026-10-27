"use client";

import { memo } from "react";
import { Alert, Empty } from "antd";
import { RotateCw } from "lucide-react";

import { cn } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";
import { useCollectionTower } from "@/hooks/useCollectionTower";
import { useCollectionTowerRefresh } from "@/hooks/useCollectionTowerRefresh";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { FOOT_NOTE } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { fmtCutoff, fmtCutoffShort } from "../../utils/format";
import AgingCard from "../aging-card/aging-card";
import AgreementsChart from "../agreements-chart/agreements-chart";
import AgreementsTable from "../agreements-table/agreements-table";
import ApplicationCard from "../application-card/application-card";
import DailyCollectionChart from "../daily-collection-chart/daily-collection-chart";
import ExecutivesTable from "../executives-table/executives-table";
import FilterChips from "../filter-chips/filter-chips";
import GoalCard from "../goal-card/goal-card";
import GoalTable from "../goal-table/goal-table";
import RecaudoHeader from "../recaudo-header/recaudo-header";
import TorreToolbar from "../torre-toolbar/torre-toolbar";
import TowerSkeleton from "../tower-skeleton/tower-skeleton";
import UnappliedTable from "../unapplied-table/unapplied-table";

/** Gráfico a la izquierda y su tabla a la derecha; una columna en pantallas angostas. */
const PAIR =
  "grid grid-cols-1 items-stretch gap-3.5 min-[1180px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]";

/**
 * Corte de la foto. Viene del API (mes cerrado: el último día a las 11:59 p. m.):
 * no se toma del reloj del navegador.
 *
 * Al lado, como en el Home de Clientes: "Actualizar ahora" regenera la foto
 * (solo administradores, es pesado); el resto recarga lo último disponible.
 */
function Cutoff({
  cutoffAt,
  refreshing,
  updating,
  noProject,
  canRegenerate,
  onRefresh
}: {
  cutoffAt?: string;
  refreshing: boolean;
  /** Se está generando una foto nueva pedida con el botón. */
  updating: boolean;
  noProject: boolean;
  canRegenerate: boolean;
  onRefresh: () => void;
}) {
  if (noProject) return null;
  const busy = refreshing || updating;
  const label = canRegenerate ? "Actualizar ahora" : "Recargar";
  return (
    // Igual que el corte del Home de Clientes: "● Corte 26/10 · 13:17 ↻" (fecha completa en el title).
    <span
      className="flex items-center gap-1.5"
      title={cutoffAt ? `Corte ${fmtCutoff(cutoffAt)}` : undefined}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", busy && "animate-pulse")}
        style={{ background: busy ? "#f5b700" : "#9bb514" }}
      />
      {updating
        ? "Actualizando…"
        : cutoffAt
          ? `Corte ${fmtCutoffShort(cutoffAt)}`
          : "Cargando corte…"}
      <button
        type="button"
        title={label}
        aria-label={label}
        disabled={busy}
        onClick={onRefresh}
        className="-my-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-cp-ink hover:bg-cp-line disabled:cursor-default disabled:opacity-50"
      >
        <RotateCw className={cn("h-[15px] w-[15px]", busy && "animate-spin")} />
      </button>
    </span>
  );
}

/**
 * El tablero con datos. memo: escribir en el buscador o abrir los filtros
 * re-renderiza TorreBoard sin cambiar `data`, y el tablero no tiene que repintarse.
 */
const TorreContent = memo(function TorreContent({ data }: { data: ICollectionTower }) {
  return (
    <>
      {/* Tres filas compartidas (encabezado, barra, leyenda): aplicación y tramos son
          subgrid y la tarjeta de recaudo las ocupa enteras; su sobrante va a la última. */}
      <section className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 min-[1180px]:grid-cols-[minmax(0,2.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)] min-[1180px]:grid-rows-[auto_auto_1fr]">
        <GoalCard data={data} className="row-span-3 sm:col-span-2 min-[1180px]:col-span-1" />
        <ApplicationCard data={data} />
        <AgingCard data={data} />
      </section>
      <section className={PAIR}>
        <DailyCollectionChart data={data} />
        <GoalTable data={data} />
      </section>
      <section className={PAIR}>
        <AgreementsChart data={data} />
        <AgreementsTable data={data} />
      </section>
      <ExecutivesTable data={data} />
      <UnappliedTable data={data} />
      <p className="m-0 max-w-[120ch] text-[11px] leading-relaxed text-muted-foreground">
        {FOOT_NOTE}
      </p>
    </>
  );
});

/**
 * Tablero "Torre de control de recaudo": meta, forecast, acuerdos de pago y PNA del mes.
 *
 * Al cambiar un filtro el tablero pasa al skeleton hasta que llega el nuevo
 * (no se repinta el anterior con los filtros nuevos). El encabezado sigue con
 * el último tablero recibido: los catálogos y periodos no se apagan.
 */
export default function TorreBoard() {
  const { filters } = useTowerFilters();
  const { data, lastData, loading, refreshing, error, noProject, pending, reload } =
    useCollectionTower(filters);
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  // Regenerar la foto es pesado: solo administradores (mismo criterio que el
  // backend, `isAdminORSuperAdmin`, y que el Home de Clientes).
  const canRegenerate = useAppStore(
    (s) => Boolean(s.selectedProject?.isSuperAdmin) || s.selectedProject?.rol_id === 2
  );
  const { refresh, refreshing: updating } = useCollectionTowerRefresh(
    projectId,
    canRegenerate,
    reload
  );

  return (
    <>
      <RecaudoHeader
        info={
          <Cutoff
            cutoffAt={lastData?.cutoffAt}
            refreshing={loading || refreshing}
            updating={updating}
            noProject={noProject}
            canRegenerate={canRegenerate}
            onRefresh={canRegenerate ? refresh : reload}
          />
        }
        tools={<TorreToolbar data={lastData} />}
        below={<FilterChips data={lastData} />}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar la torre de control"
          description={error.message}
        />
      )}

      {pending && (
        <Alert
          type="info"
          showIcon
          message="Estamos preparando la foto de recaudo"
          description="Es la primera vez que se abre en este proyecto: el tablero aparece solo en unos segundos."
        />
      )}

      {noProject && (
        <Empty
          className="rounded-xl bg-card p-10 shadow-sm"
          description="Elige un proyecto para ver la torre de control de recaudo."
        />
      )}

      {data ? (
        <div className={cn("flex flex-col gap-3.5 transition-opacity", refreshing && "opacity-70")}>
          <TorreContent data={data} />
        </div>
      ) : (
        loading && <TowerSkeleton />
      )}
    </>
  );
}
