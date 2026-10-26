"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "react-query";
import { useShallow } from "zustand/react/shallow";

import { useAppStore } from "@/lib/store/store";
import { usePortfolioClientsRefresh } from "@/hooks/usePortfolioClientsRefresh";
import { useClientsHomeSummary } from "../../../hooks/clients-home/use-clients-home";
import { useClientsHomeFilters } from "../../../stores/clients-home-filters";
import {
  AGING_BY_KEY,
  CLIENTS_HOME_PATH,
  CLIENTS_HOME_QUERY_KEY,
  FORECAST_STATUS
} from "../../../constants/clients-home";
import { fmtCutoff, fmtCutoffShort, fmtIsoDate } from "../../../utils/clients-home-format";
import {
  FilterButton,
  FilterChips,
  MiniSwitch,
  type FilterChipItem
} from "@/components/ui/page-header-controls/page-header-controls";
import ClientsHomeFilterModal from "../clients-home-filter-modal/clients-home-filter-modal";

/* El layout de /clientes también envuelve el detalle del cliente: estas
   piezas solo se muestran en el Home. */

/** Bajo el título: corte de la foto, refrescar y "Proyectar a cierre". */
export const ClientsHomeHeaderExtra = () => {
  const pathname = usePathname();
  if (pathname !== CLIENTS_HOME_PATH) return null;
  return <HeaderExtra />;
};

/** A la derecha del encabezado: chips de filtros activos, "Filtrar" y el buscador. */
export const ClientsHomeHeaderActions = () => {
  const pathname = usePathname();
  if (pathname !== CLIENTS_HOME_PATH) return null;
  return <HeaderActions />;
};

const HeaderExtra = () => {
  const { isSuperAdmin, rol_id } = useAppStore((s) => s.selectedProject);
  const queryClient = useQueryClient();
  const { summary, pending, isFetching } = useClientsHomeSummary();
  const [proj, setProj] = useClientsHomeFilters(
    useShallow((s) => [s.projectToMonthEnd, s.setProjectToMonthEnd] as const)
  );

  const reload = () => queryClient.invalidateQueries(CLIENTS_HOME_QUERY_KEY);
  // Recalcular la foto es pesado: solo administradores (mismo criterio que el
  // backend, `isAdminORSuperAdmin`). El resto recarga lo último disponible.
  const canRegenerate = Boolean(isSuperAdmin) || rol_id === 2;
  const { refresh, refreshing } = usePortfolioClientsRefresh(canRegenerate, reload);
  const busy = refreshing || isFetching;

  const corte = refreshing
    ? "Actualizando…"
    : pending
      ? "Generando información…"
      : summary
        ? `Corte ${fmtCutoffShort(summary.cutoffAt)}`
        : "Corte —";

  // A la derecha del título, en una línea: el corte con recargar y luego "Proyectar a cierre".
  return (
    <>
      <span
        className="flex items-center gap-1.5"
        title={summary ? `Corte ${fmtCutoff(summary.cutoffAt)}` : undefined}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: refreshing || pending ? "#f5b700" : "#9bb514" }}
        />
        {corte}
        <button
          type="button"
          title={canRegenerate ? "Actualizar ahora" : "Recargar"}
          disabled={busy}
          onClick={canRegenerate ? refresh : reload}
          className="-my-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-cp-ink hover:bg-cp-line disabled:cursor-default disabled:opacity-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={busy ? "animate-spin" : undefined}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </span>
      <MiniSwitch
        checked={proj}
        onChange={setProj}
        label="Proyectar a cierre"
        title="Proyecta las edades de la cartera al cierre del mes"
      />
    </>
  );
};

const HeaderActions = () => {
  const { summary } = useClientsHomeSummary();
  const f = useClientsHomeFilters(
    useShallow((s) => ({
      aging: s.aging,
      forecastStatuses: s.forecastStatuses,
      executives: s.executives,
      coordinators: s.coordinators,
      markets: s.markets,
      dueFrom: s.dueFrom,
      dueTo: s.dueTo,
      duePeriod: s.duePeriod,
      setAging: s.setAging,
      setForecastStatuses: s.setForecastStatuses,
      setExecutives: s.setExecutives,
      setCoordinators: s.setCoordinators,
      setMarkets: s.setMarkets,
      setDue: s.setDue
    }))
  );
  const [open, setOpen] = useState(false);

  const executiveName = (key: string) =>
    summary?.executives.find((e) => e.key === key)?.name ?? "Sin ejecutivo";
  const coordinatorName = (key: string) =>
    summary?.coordinators?.find((c) => c.key === key)?.name ?? "Sin coordinador";
  const hasDue = Boolean(f.dueFrom || f.dueTo);

  // El mercado no cuenta ni sale como chip: tiene su propia leyenda en la tabla.
  const chips: FilterChipItem[] = [];
  if (f.aging) {
    chips.push({
      key: "aging",
      label: "Edad",
      value: AGING_BY_KEY[f.aging].label,
      onRemove: () => f.setAging(null)
    });
  }
  if (f.forecastStatuses.length) {
    chips.push({
      key: "forecast",
      label: "Forecast",
      value: f.forecastStatuses.map((s) => FORECAST_STATUS[s].label).join(", "),
      onRemove: () => f.setForecastStatuses([])
    });
  }
  if (hasDue) {
    chips.push({
      key: "due",
      label: "Fecha",
      value: f.duePeriod ?? `${fmtIsoDate(f.dueFrom)} – ${fmtIsoDate(f.dueTo)}`,
      onRemove: () => f.setDue(null, null, null)
    });
  }
  if (f.coordinators.length) {
    chips.push({
      key: "coordinators",
      label: "Coordinador",
      value: f.coordinators.map(coordinatorName).join(", "),
      onRemove: () => f.setCoordinators([])
    });
  }
  if (f.executives.length) {
    chips.push({
      key: "executives",
      label: "Ejecutivo",
      value: f.executives.map(executiveName).join(", "),
      onRemove: () => f.setExecutives([])
    });
  }

  return (
    <>
      <FilterChips chips={chips} />
      <FilterButton count={chips.length} onClick={() => setOpen(true)} />
      {open && (
        <ClientsHomeFilterModal
          initial={{
            due: { from: f.dueFrom ?? "", to: f.dueTo ?? "", period: f.duePeriod },
            executives: f.executives,
            coordinators: f.coordinators,
            markets: f.markets
          }}
          executives={summary?.executives ?? []}
          coordinators={summary?.coordinators ?? []}
          markets={summary?.markets ?? []}
          onClose={() => setOpen(false)}
          onApply={(draft) => {
            f.setDue(draft.due.from || null, draft.due.to || null, draft.due.period);
            f.setExecutives(draft.executives);
            f.setCoordinators(draft.coordinators);
            f.setMarkets(draft.markets);
            setOpen(false);
          }}
        />
      )}
    </>
  );
};
