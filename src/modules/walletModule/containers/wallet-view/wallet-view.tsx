"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useWalletMatrix,
  useWalletMatrixGroups,
  useWalletMatrixStatus
} from "@/hooks/useWalletMatrix";
import { refreshWalletMatrix } from "@/services/walletMatrix/walletMatrix";
import { useWalletMatrixSocket } from "@/context/WalletMatrixSocketContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMessageApi } from "@/context/MessageContext";

import ControlMatrix from "../../components/control-matrix/control-matrix";
import GroupDetailModal from "../../components/group-detail-modal/group-detail-modal";
import InvoiceGroups from "../../components/invoice-groups/invoice-groups";
import WalletFilters from "../../components/wallet-filters/wallet-filters";
import WalletHeader from "../../components/wallet-header/wallet-header";
import WalletStatCards from "../../components/wallet-stat-cards/wallet-stat-cards";
import { emptySummary, toClientRows, toGroupRows, toSummary } from "../../utils/api-adapter";

import type { IWalletMatrixFilters } from "@/types/portfolios/IWalletMatrix";

const PAGE_SIZE = 50;

/** Máximo que se espera a una corrida antes de devolver el botón al usuario. */
const REFRESH_TIMEOUT_MS = 3 * 60 * 1000;

export default function WalletView() {
  const { showMessage } = useMessageApi();
  const { refreshedAt, isRefreshing: socketRefreshing } = useWalletMatrixSocket();

  // `search` es lo que se ve escrito; `debouncedSearch` es lo que se consulta.
  // Sin el debounce cada tecla dispara una consulta sobre toda la foto.
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [calculateEndMonth, setCalculateEndMonth] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  /**
   * Foto vigente en el momento de disparar la actualización. La corrida
   * terminó cuando aparece una DISTINTA a esta.
   *
   * No sirve preguntar "¿hay una corrida viva?": ese estado llega cacheado de
   * antes del clic y apagaría el spinner en el mismo render en que se
   * enciende. Y tampoco sirve tomar el runId de la matriz en pantalla, que
   * puede venir de una foto ya vieja — si el worker generó otra entremedio,
   * la comparación daría "foto nueva" de inmediato. Por eso la referencia se
   * lee del endpoint de estado recién consultado, no de la caché.
   */
  const [baselineRunId, setBaselineRunId] = useState<string | null>(null);
  const [baselineReady, setBaselineReady] = useState(false);
  // Clave del grupo abierto en el modal de gestión. Vive en la vista y no en la
  // tabla para que el drilldown de la matriz pueda abrir el mismo modal.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const filters: IWalletMatrixFilters = useMemo(
    () => ({ search: debouncedSearch.trim() || undefined, calculateEndMonth }),
    [debouncedSearch, calculateEndMonth]
  );

  const { data: matrix, loading, error, mutate } = useWalletMatrix(filters, 1, PAGE_SIZE);
  const { data: groups } = useWalletMatrixGroups(filters, undefined, undefined, matrix?.snapshot?.runId);

  // El polling sólo corre mientras hay una actualización viva. Es el respaldo
  // del socket: si el evento no llega —el usuario puede estar conectado a otra
  // réplica del backend— la pantalla se entera igual de que ya terminó.
  const isRefreshing = refreshing || socketRefreshing;
  const { data: status, mutate: mutateStatus } = useWalletMatrixStatus(isRefreshing);

  const stopRefreshing = useCallback(() => {
    setRefreshing(false);
    setBaselineRunId(null);
    setBaselineReady(false);
  }, []);

  // El socket avisa que el worker terminó.
  useEffect(() => {
    if (!refreshedAt) return;
    stopRefreshing();
    mutate();
    mutateStatus();
  }, [refreshedAt, mutate, mutateStatus, stopRefreshing]);

  // Respaldo por polling, para cuando el evento del socket no llega: se
  // considera terminada cuando el último run completado ya no es el que se
  // estaba viendo al pulsar el botón.
  useEffect(() => {
    // Hasta no tener la referencia recién leída no se puede concluir nada:
    // cualquier comparación contra datos cacheados apagaría el spinner antes
    // de tiempo.
    if (!refreshing || !baselineReady || !status) return;

    const currentRunId = status.current?.runId ?? null;
    const hayFotoNueva = currentRunId !== null && currentRunId !== baselineRunId;

    if (hayFotoNueva && !status.isRefreshing) {
      stopRefreshing();
      mutate();
    }
  }, [refreshing, baselineReady, status, baselineRunId, mutate, stopRefreshing]);

  // Tope de espera: si una corrida queda colgada, el botón vuelve en vez de
  // dejar el spinner girando para siempre y al usuario sin forma de reintentar.
  useEffect(() => {
    if (!refreshing) return;

    const id = setTimeout(() => {
      stopRefreshing();
      mutate();
      showMessage(
        "warning",
        "La actualización está tardando más de lo esperado. Se muestra la última foto disponible."
      );
    }, REFRESH_TIMEOUT_MS);

    return () => clearTimeout(id);
  }, [refreshing, mutate, showMessage, stopRefreshing]);

  const handleRefresh = async () => {
    // Guarda de reentrada: aunque el botón ya no se renderiza mientras corre,
    // esto evita una segunda petición si llegan dos clics muy seguidos.
    if (refreshing) return;

    try {
      setRefreshing(true);
      setBaselineReady(false);

      const response = await refreshWalletMatrix();
      showMessage("info", response.message || "Actualización de matriz iniciada");

      // Referencia tomada del servidor, no de la caché, y sólo después de
      // haber disparado la corrida.
      const fresh = await mutateStatus();
      setBaselineRunId(fresh?.data?.current?.runId ?? null);
      setBaselineReady(true);
    } catch (error) {
      // 409 significa que YA hay una corrida en curso. No es un error del
      // usuario y, sobre todo, no hay que quitar el loader: la actualización
      // sí está pasando, sólo que la disparó alguien más.
      const isConflict = (error as { status?: number })?.status === 409;
      if (isConflict) {
        showMessage("info", "Ya hay una actualización en curso");
        const fresh = await mutateStatus();
        setBaselineRunId(fresh?.data?.current?.runId ?? null);
        setBaselineReady(true);
        return;
      }
      stopRefreshing();
      showMessage("error", "No se pudo iniciar la actualización");
    }
  };

  const clientRows = useMemo(() => (matrix ? toClientRows(matrix) : []), [matrix]);
  const summary = useMemo(() => (matrix ? toSummary(matrix) : emptySummary()), [matrix]);
  const groupRows = useMemo(() => (groups ? toGroupRows(groups) : []), [groups]);

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <WalletHeader
        search={search}
        onSearchChange={setSearch}
        lastUpdatedAt={matrix?.snapshot?.lastUpdatedAt}
        cutoffDate={matrix?.cutoff?.date}
        projected={calculateEndMonth}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onToggleProjection={setCalculateEndMonth}
      />

      <h2 className="text-lg font-semibold text-foreground">Cartera por cliente y tramo</h2>

      <WalletFilters summary={summary} />
      <WalletStatCards summary={summary} />

      {loading && !matrix ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Cargando cartera…</p>
      ) : error ? (
        // Se muestra el motivo real y no un "no hay cartera": la causa más
        // común es no tener grupos de clientes asignados en el proyecto, que
        // no es lo mismo que un proyecto sin cartera.
        <p className="py-10 text-center text-sm text-rose-600 dark:text-rose-400">
          {(error as Error)?.message || "No se pudo cargar la cartera."}
        </p>
      ) : !clientRows.length ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {debouncedSearch.trim()
            ? `No se encontró nada para "${debouncedSearch.trim()}".`
            : "No hay cartera para los filtros actuales."}
        </p>
      ) : (
        <ControlMatrix
          rows={clientRows}
          search={search}
          onSearchChange={setSearch}
          totalClients={matrix?.pagination.totalClients ?? 0}
          loading={loading}
        />
      )}

      <InvoiceGroups rows={groupRows} onOpenDetail={setOpenGroup} />

      <GroupDetailModal clave={openGroup} onClose={() => setOpenGroup(null)} />
    </div>
  );
}
