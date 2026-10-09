"use client";

import { useEffect } from "react";
import { Alert } from "antd";

import { useAppStore } from "@/lib/store/store";
import ClientsHomeKpis from "../../components/clients-home/clients-home-kpis/clients-home-kpis";
import ClientsHomeTable from "../../components/clients-home/clients-home-table/clients-home-table";
import {
  useClientsHomeClients,
  useClientsHomeSummary
} from "../../hooks/clients-home/use-clients-home";
import { useClientsHomeFilters } from "../../stores/clients-home-filters";

/**
 * Home de Clientes (/clientes/all): KPIs de cartera, recaudo vs meta y la
 * tabla por cliente. El encabezado (corte, proyección y filtros) lo pone el
 * layout de /clientes con `ClientsHomeHeaderExtra` / `ClientsHomeHeaderActions`.
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

  return (
    <div className="flex flex-col text-[#141414]">
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

      <ClientsHomeKpis
        totals={summary.summary?.totals ?? null}
        loading={summary.isLoading || pending}
      />

      <ClientsHomeTable
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
