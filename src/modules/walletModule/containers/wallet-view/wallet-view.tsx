"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useWalletMatrix,
  useWalletMatrixGroups,
  useWalletMatrixStatus
} from "@/hooks/useWalletMatrix";
import { refreshWalletMatrix } from "@/services/walletMatrix/walletMatrix";
import { useWalletMatrixSocket } from "@/context/WalletMatrixSocketContext";
import { useMessageApi } from "@/context/MessageContext";

import ControlMatrix from "../../components/control-matrix/control-matrix";
import GroupDetailModal from "../../components/group-detail-modal/group-detail-modal";
import InvoiceGroups from "../../components/invoice-groups/invoice-groups";
import WalletFilters from "../../components/wallet-filters/wallet-filters";
import WalletHeader from "../../components/wallet-header/wallet-header";
import WalletStatCards from "../../components/wallet-stat-cards/wallet-stat-cards";
import {
  GroupsSkeleton,
  MatrixSkeleton,
  StatCardsSkeleton
} from "../../components/wallet-skeleton/wallet-skeleton";
import {
  TRAMO_BUCKETS,
  emptySummary,
  groupKey,
  toClientRows,
  toGroupDetail,
  toGroupRows,
  toSummary
} from "../../utils/api-adapter";
import { corto } from "../../utils/format";
import { facturasDeEjemplo } from "../../mocked-data";

import type { IWalletDrilldown } from "../../types";
import type { IWalletMatrixFilters } from "@/types/portfolios/IWalletMatrix";

const PAGE_SIZE = 15;

/** Máximo que se espera a una corrida antes de devolver el botón al usuario. */
const REFRESH_TIMEOUT_MS = 3 * 60 * 1000;

export default function WalletView() {
  const { showMessage } = useMessageApi();
  const { refreshedAt, isRefreshing: socketRefreshing } = useWalletMatrixSocket();

  // Los dos buscadores —el de la barra superior y el de la matriz— comparten
  // este estado, pero por ahora no consultan nada: quedan sólo como interfaz.
  // Reconectarlos es volver a poner `search` en `filters`; el endpoint de la
  // matriz sigue soportándolo, el de grupos no.
  const [search, setSearch] = useState("");
  const [calculateEndMonth, setCalculateEndMonth] = useState(false);
  // Página de la matriz: la pagina el servidor, la vista sólo pide la que toca.
  const [page, setPage] = useState(1);
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
  // Celda o cliente seleccionado en la matriz. Acota los grupos de abajo.
  const [drilldown, setDrilldown] = useState<IWalletDrilldown | null>(null);

  const filters: IWalletMatrixFilters = useMemo(() => ({ calculateEndMonth }), [calculateEndMonth]);

  const { data: matrix, loading, error, mutate } = useWalletMatrix(filters, page, PAGE_SIZE);
  // El acotado lo resuelve el servidor: la página sólo tiene 15 clientes, así
  // que filtrar los grupos en el navegador dejaría fuera lo que no vino. El
  // runId sale de la matriz para que las dos tablas lean la MISMA foto; hasta
  // que llegue, el hook no pide nada.
  const { data: groups, loading: groupsLoading } = useWalletMatrixGroups(
    matrix?.snapshot?.runId,
    drilldown?.clienteId,
    // `tramo` puede ser 0 (corriente), que es falsy: sin esta comparación
    // explícita, un `&&` dejaría fuera justo esa columna.
    drilldown?.tramo === null || drilldown?.tramo === undefined
      ? undefined
      : TRAMO_BUCKETS[drilldown.tramo],
    calculateEndMonth
  );

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

  // Al cambiar la proyección, la celda elegida deja de tener sentido: las
  // edades se recalculan y la cartera se mueve de tramo. La página vuelve a la
  // primera por lo mismo: el orden de los clientes ya no es el que era.
  useEffect(() => {
    setDrilldown(null);
    setPage(1);
  }, [calculateEndMonth]);

  // Al cambiar de página el cliente elegido ya no está en la tabla, así que la
  // selección se suelta: si no, los grupos de abajo quedarían acotados a un
  // cliente que no se ve.
  const handlePageChange = (next: number) => {
    setPage(next);
    setDrilldown(null);
  };

  // Volver a pulsar la celda elegida la suelta: es la forma de salir del acotado
  // desde la matriz sin bajar al "Ver todos" de los grupos. Otra celda de la
  // misma fila no suelta nada, sólo mueve la selección.
  const handleSelect = (next: IWalletDrilldown) =>
    setDrilldown((prev) =>
      prev && prev.clienteId === next.clienteId && prev.tramo === next.tramo ? null : next
    );

  const clientRows = useMemo(() => (matrix ? toClientRows(matrix) : []), [matrix]);
  const summary = useMemo(() => (matrix ? toSummary(matrix) : emptySummary()), [matrix]);
  const groupRows = useMemo(() => (groups ? toGroupRows(groups) : []), [groups]);

  // Grupo abierto, tal como vino del API: el modal necesita más campos de los
  // que sobreviven en la fila de la tabla.
  const grupoAbierto = useMemo(
    () => groups?.groups.find((g) => groupKey(g) === openGroup) ?? null,
    [groups, openGroup]
  );

  // Todo el modal sale del grupo que ya está en memoria: no hay endpoint que
  // devuelva las facturas de un grupo, así que la tabla se llena con una
  // muestra derivada del reparto por tramo. El tramo del drilldown viaja con
  // el detalle porque, cuando lo hay, las cifras del grupo llegan acotadas a
  // él y el modal tiene que decirlo.
  const detalleAbierto = useMemo(
    () =>
      grupoAbierto
        ? toGroupDetail(grupoAbierto, facturasDeEjemplo(grupoAbierto), drilldown?.tramo ?? null)
        : null,
    [grupoAbierto, drilldown]
  );

  const clienteNombre = useMemo(() => {
    if (!drilldown) return null;
    const fila = clientRows.find((c) => c.id === drilldown.clienteId);
    return fila ? corto(fila.nombre) : null;
  }, [drilldown, clientRows]);

  // Sólo la primera carga muestra skeleton. Con `keepPreviousData`, cambiar un
  // filtro o buscar mantiene la tabla anterior en pantalla, que se lee mucho
  // mejor que ver todo desaparecer y volver.
  const primeraCarga = !matrix && !error;

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

      {/* <WalletFilters summary={summary} /> */}

      {primeraCarga ? <StatCardsSkeleton /> : <WalletStatCards summary={summary} />}

      {primeraCarga ? (
        <MatrixSkeleton />
      ) : error ? (
        // Se muestra el motivo real y no un "no hay cartera": la causa más
        // común es no tener grupos de clientes asignados en el proyecto, que
        // no es lo mismo que un proyecto sin cartera.
        <p className="py-10 text-center text-sm text-rose-600 dark:text-rose-400">
          {(error as Error)?.message || "No se pudo cargar la cartera."}
        </p>
      ) : (
        // La tabla se renderiza siempre, incluso sin resultados: su buscador
        // vive dentro, y ocultarla dejaría al usuario sin forma de corregir o
        // borrar lo que escribió.
        <ControlMatrix
          rows={clientRows}
          search={search}
          onSearchChange={setSearch}
          totalClients={matrix?.pagination.totalClients ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          loading={loading}
          emptyMessage="No hay cartera para los filtros actuales."
          drilldown={drilldown}
          onSelect={handleSelect}
        />
      )}

      {primeraCarga || (groupsLoading && !groups) ? (
        <GroupsSkeleton />
      ) : (
        <InvoiceGroups
          rows={groupRows}
          onOpenDetail={setOpenGroup}
          drilldown={drilldown}
          clienteNombre={clienteNombre}
          openGroup={openGroup}
          onClearDrilldown={() => setDrilldown(null)}
        />
      )}

      <GroupDetailModal
        clave={openGroup}
        detail={detalleAbierto}
        onClose={() => setOpenGroup(null)}
      />
    </div>
  );
}
