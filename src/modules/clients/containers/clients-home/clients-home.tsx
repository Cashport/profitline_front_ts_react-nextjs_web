"use client";

import { useEffect, useRef } from "react";
import { Alert } from "antd";

import { useAppStore } from "@/lib/store/store";
import ClientsHomeKpis from "../../components/clients-home/clients-home-kpis/clients-home-kpis";
import ClientsHomeTable from "../../components/clients-home/clients-home-table/clients-home-table";
import {
  useClientsHomeClients,
  useClientsHomeSummary
} from "../../hooks/clients-home/use-clients-home";
import { useHideOnScroll } from "../../hooks/clients-home/use-hide-on-scroll";
import { useClientsHomeFilters } from "../../stores/clients-home-filters";

/**
 * Home de Clientes (/clientes/all): KPIs de cartera, recaudo vs meta y la
 * tabla por cliente. El encabezado (corte, proyección y filtros) lo pone el
 * layout de /clientes con `ClientsHomeHeaderExtra` / `ClientsHomeHeaderActions`.
 *
 * La página no tiene scroll propio: ocupa el alto bajo el encabezado y, al
 * bajar, los KPIs se esconden para que la tabla tome su lugar; al subir vuelven.
 */
export default function ClientsHome() {
  const projectId = useAppStore((s) => s.selectedProject?.ID ?? null);
  const syncProject = useClientsHomeFilters((s) => s.syncProject);

  useEffect(() => {
    syncProject(projectId);
  }, [projectId, syncProject]);

  const summary = useClientsHomeSummary();
  const clients = useClientsHomeClients();
  const pending = summary.pending || clients.pending;

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const kpisHidden = useHideOnScroll(rootRef, listRef);

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col text-[#141414]">
      {pending && (
        <Alert
          className="mb-3"
          type="info"
          showIcon
          message="Estamos preparando la información de cartera de este proyecto"
          description="Aparecerá aquí en unos minutos; la página se actualiza sola."
        />
      )}
      {summary.error && !pending && (
        <Alert className="mb-3" type="error" showIcon message={summary.error.message} />
      )}

      {/* Colapsa a alto 0 (fila 1fr → 0fr) sin medir las tarjetas. */}
      <div
        aria-hidden={kpisHidden}
        className="grid flex-none transition-[grid-template-rows,opacity] duration-200 ease-out"
        style={{ gridTemplateRows: kpisHidden ? "0fr" : "1fr", opacity: kpisHidden ? 0 : 1 }}
      >
        <div className="min-h-0 overflow-hidden">
          <ClientsHomeKpis
            totals={summary.summary?.totals ?? null}
            loading={summary.isLoading || pending}
          />
        </div>
      </div>

      <ClientsHomeTable
        listRef={listRef}
        markets={summary.summary?.markets ?? []}
        executives={summary.summary?.executives ?? []}
        rows={clients.rows}
        meta={clients.meta}
        loading={pending || clients.isLoading}
        refreshing={clients.isFetching && !clients.isFetchingNextPage && !clients.isLoading}
        error={clients.error}
        hasNextPage={clients.hasNextPage}
        isFetchingNextPage={clients.isFetchingNextPage}
        fetchNextPage={clients.fetchNextPage}
      />
    </div>
  );
}
