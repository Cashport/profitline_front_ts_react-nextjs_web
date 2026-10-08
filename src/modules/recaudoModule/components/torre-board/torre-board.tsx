"use client";

import { Alert } from "antd";

import { cn } from "@/utils/utils";
import { useCollectionTower } from "@/hooks/useCollectionTower";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { FOOT_NOTE } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { fmtCutoff } from "../../utils/format";
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
 */
function Cutoff({ cutoffAt, refreshing }: { cutoffAt?: string; refreshing: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          refreshing ? "animate-pulse bg-amber-500" : "bg-emerald-500"
        )}
      />
      {cutoffAt ? `Corte ${fmtCutoff(cutoffAt)}` : "Cargando corte…"}
    </span>
  );
}

function TorreContent({ data }: { data: ICollectionTower }) {
  return (
    <>
      <section className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 min-[1180px]:grid-cols-[minmax(0,2.15fr)_minmax(0,1.3fr)_minmax(0,1.1fr)]">
        <GoalCard data={data} className="sm:col-span-2 min-[1180px]:col-span-1" />
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
}

/** Tablero "Torre de control de recaudo": meta, forecast, acuerdos de pago y PNA del mes. */
export default function TorreBoard() {
  const { filters } = useTowerFilters();
  const { data, loading, validating, error } = useCollectionTower(filters);
  const refreshing = validating && !loading;

  return (
    <>
      <RecaudoHeader
        info={<Cutoff cutoffAt={data?.cutoffAt} refreshing={refreshing} />}
        tools={<TorreToolbar data={data} />}
        below={<FilterChips data={data} />}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar la torre de control"
          description={error.message}
        />
      )}

      {data ? (
        <div
          className={cn(
            "flex flex-col gap-3.5 transition-opacity",
            refreshing && "opacity-70"
          )}
        >
          <TorreContent data={data} />
        </div>
      ) : (
        loading && <TowerSkeleton />
      )}
    </>
  );
}
