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
  CLIENTS_HOME_QUERY_KEY,
  FORECAST_STATUS
} from "../../../constants/clients-home";
import { fmtCutoff, fmtIsoDate } from "../../../utils/clients-home-format";
import ClientsHomeFilterModal from "../clients-home-filter-modal/clients-home-filter-modal";

const CLIENTS_HOME_PATH = "/clientes/all";

/* El layout de /clientes también envuelve el detalle del cliente: estas
   piezas solo se muestran en el Home. */

/** Junto al título: corte de la foto, refrescar y "Proyectar a cierre de mes". */
export const ClientsHomeHeaderExtra = () => {
  const pathname = usePathname();
  if (pathname !== CLIENTS_HOME_PATH) return null;
  return <HeaderExtra />;
};

/** A la derecha del encabezado: chips de filtros activos y "Filtrar". */
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
        ? `Corte ${fmtCutoff(summary.cutoffAt)}`
        : "Corte —";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 whitespace-nowrap text-xs font-normal text-[#6b6b6b]">
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: refreshing || pending ? "#f5c542" : "#7cb518" }}
        />
        {corte}
        <button
          type="button"
          title={canRegenerate ? "Actualizar ahora" : "Recargar"}
          disabled={busy}
          onClick={canRegenerate ? refresh : reload}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent hover:bg-[#ececec] disabled:cursor-default disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#141414"
            strokeWidth="2"
            strokeLinecap="round"
            className={busy ? "animate-spin" : undefined}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>
      <label
        onClick={() => setProj(!proj)}
        title="Proyecta las edades de la cartera al cierre del mes"
        className="flex h-[30px] cursor-pointer select-none items-center gap-2 whitespace-nowrap text-[13px] font-normal text-[#4a4a4a]"
      >
        <span
          className="box-border flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px]"
          style={{
            border: `1.5px solid ${proj ? "#141414" : "#b5b5b5"}`,
            background: proj ? "#cbe71e" : "#fff"
          }}
        >
          {proj && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#141414"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          )}
        </span>
        Proyectar a cierre de mes
      </label>
    </div>
  );
};

const HeaderActions = () => {
  const { summary } = useClientsHomeSummary();
  const f = useClientsHomeFilters(
    useShallow((s) => ({
      aging: s.aging,
      forecastStatuses: s.forecastStatuses,
      executives: s.executives,
      markets: s.markets,
      dueFrom: s.dueFrom,
      dueTo: s.dueTo,
      duePeriod: s.duePeriod,
      setAging: s.setAging,
      setForecastStatuses: s.setForecastStatuses,
      setExecutives: s.setExecutives,
      setMarkets: s.setMarkets,
      setDue: s.setDue
    }))
  );
  const [open, setOpen] = useState(false);

  const executiveName = (key: string) =>
    summary?.executives.find((e) => e.key === key)?.name ?? "Sin ejecutivo";
  const hasDue = Boolean(f.dueFrom || f.dueTo);

  // El mercado no cuenta ni sale como chip: tiene su propia leyenda en la tabla.
  const chips: { cat: string; vals: string; remove: () => void }[] = [];
  if (f.aging) {
    chips.push({ cat: "Edad", vals: AGING_BY_KEY[f.aging].label, remove: () => f.setAging(null) });
  }
  if (f.forecastStatuses.length) {
    chips.push({
      cat: "Forecast",
      vals: f.forecastStatuses.map((s) => FORECAST_STATUS[s].label).join(", "),
      remove: () => f.setForecastStatuses([])
    });
  }
  if (hasDue) {
    chips.push({
      cat: "Fecha",
      vals: f.duePeriod ?? `${fmtIsoDate(f.dueFrom)} – ${fmtIsoDate(f.dueTo)}`,
      remove: () => f.setDue(null, null, null)
    });
  }
  if (f.executives.length) {
    chips.push({
      cat: "Ejecutivo",
      vals: f.executives.map(executiveName).join(", "),
      remove: () => f.setExecutives([])
    });
  }
  const activeCount = chips.length;

  return (
    <div className="ml-auto flex min-w-0 flex-[1_1_280px] flex-wrap items-center justify-end gap-1.5">
      {chips.map((c) => (
        <span
          key={c.cat}
          className="flex h-[30px] max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg bg-[#f4f9d2] pl-2.5 pr-1.5 text-xs text-[#141414]"
        >
          <b className="font-semibold">{c.cat}:</b>
          {c.vals}
          <button
            type="button"
            onClick={c.remove}
            className="cursor-pointer border-0 bg-transparent px-1 py-0.5 text-sm leading-none text-[#4a4a4a]"
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="box-border flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#e3e3e3] bg-white px-3 text-[13px] font-medium text-[#8a8a8a] hover:border-[#141414]"
      >
        Filtrar
        {activeCount > 0 && (
          <span className="box-border flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-[#cbe71e] px-[5px] text-[11px] font-semibold text-[#141414]">
            {activeCount}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8a8a8a"
          strokeWidth="2.2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ClientsHomeFilterModal
          initial={{
            due: { from: f.dueFrom ?? "", to: f.dueTo ?? "", period: f.duePeriod },
            executives: f.executives,
            markets: f.markets
          }}
          executives={summary?.executives ?? []}
          markets={summary?.markets ?? []}
          onClose={() => setOpen(false)}
          onApply={(draft) => {
            f.setDue(draft.due.from || null, draft.due.to || null, draft.due.period);
            f.setExecutives(draft.executives);
            f.setMarkets(draft.markets);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};
