"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import UiSearchInput from "@/components/ui/search-input";
import {
  useWalletMatrix,
  useWalletMatrixGroups,
  useWalletMatrixStatus
} from "@/hooks/useWalletMatrix";
import { useDebounce } from "@/hooks/useDeabouce";
import { buildMatrixQuery, refreshWalletMatrix } from "@/services/walletMatrix/walletMatrix";
import { useWalletMatrixSocket } from "@/context/WalletMatrixSocketContext";
import { useMessageApi } from "@/context/MessageContext";

import ControlMatrix from "../../components/control-matrix/control-matrix";
import GroupDetailModal from "../../components/group-detail-modal/group-detail-modal";
import InvoiceGroups from "../../components/invoice-groups/invoice-groups";
import ModalFilterMatrix from "../../components/modal-filter-matrix/modal-filter-matrix";
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
import { EMPTY_MATRIX_MODAL_FILTERS, MATRIX_DEFAULT_SORT } from "../../constants";
import { nextSort } from "../../utils/wallet-calc";

import type { IWalletDrilldown, IWalletMatrixModalFilters, SortState } from "../../types";
import type {
  IWalletMatrixFilters,
  WalletMatrixSortBy,
  WalletMatrixSortDir
} from "@/types/portfolios/IWalletMatrix";

const PAGE_SIZE = 15;

/** Espera tras la última tecla antes de consultar la matriz. */
const SEARCH_DEBOUNCE_MS = 400;

/** Columnas de texto arrancan ascendentes; las numéricas, descendentes. */
const TEXTUAL_COLS: WalletMatrixSortBy[] = ["client_name"];

/** Máximo que se espera a una corrida antes de devolver el botón al usuario. */
const REFRESH_TIMEOUT_MS = 3 * 60 * 1000;

export default function WalletView() {
  const { showMessage } = useMessageApi();
  const { refreshedAt, isRefreshing: socketRefreshing } = useWalletMatrixSocket();

  // Buscador de la tarjeta de la matriz; a la consulta sólo entra la versión
  // con debounce. El endpoint de grupos no lo soporta.
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const [modalFilters, setModalFilters] = useState<IWalletMatrixModalFilters>(
    EMPTY_MATRIX_MODAL_FILTERS
  );
  // Orden del servidor sobre la foto completa; `col` es el `sort_by` del API.
  const [sort, setSort] = useState<SortState>(MATRIX_DEFAULT_SORT);
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

  const filters: IWalletMatrixFilters = useMemo(
    () => ({
      ...modalFilters,
      search: debouncedSearch,
      sort_by: sort.col as WalletMatrixSortBy,
      sort_dir: sort.dir as WalletMatrixSortDir,
      calculateEndMonth
    }),
    [modalFilters, debouncedSearch, sort, calculateEndMonth]
  );

  const { data: matrix, loading, error, mutate } = useWalletMatrix(filters, page, PAGE_SIZE);
  // El acotado lo resuelve el servidor: la página sólo tiene 15 clientes, así
  // que filtrar los grupos en el navegador dejaría fuera lo que no vino. El
  // runId sale de la matriz para que las dos tablas lean la MISMA foto; hasta
  // que llegue, el hook no pide nada.
  const {
    data: groups,
    loading: groupsLoading,
    mutate: mutateGroups
  } = useWalletMatrixGroups(
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

  // Cuando cambia la consulta (filtros, búsqueda o proyección) la celda
  // elegida deja de tener sentido y la página vuelve a la primera: el conjunto
  // y el orden de los clientes ya no son los que eran. Se observa la query
  // serializada, que no incluye la página, así que paginar no dispara nada.
  const query = buildMatrixQuery(filters);
  useEffect(() => {
    setDrilldown(null);
    setPage(1);
  }, [query]);

  // Al cambiar de página el cliente elegido ya no está en la tabla, así que la
  // selección se suelta: si no, los grupos de abajo quedarían acotados a un
  // cliente que no se ve.
  const handlePageChange = (next: number) => {
    setPage(next);
    setDrilldown(null);
  };

  // La vuelta a la primera página la hace el efecto de arriba: el orden entra
  // en la query.
  const handleSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

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

  // Grupos sin novedad: las cifras del modal salen del grupo en memoria y las
  // facturas las pide el modal sobre la misma foto (runId). El
  // tramo del drilldown viaja con el detalle porque, cuando lo hay, las cifras
  // llegan acotadas a él y el modal tiene que decirlo. Grupos con novedad: el
  // modal pide el incidente y lo reemplaza todo salvo el reparto por tramo.
  const detalleAbierto = useMemo(
    () => (grupoAbierto ? toGroupDetail(grupoAbierto, drilldown?.tramo ?? null) : null),
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
        lastUpdatedAt={matrix?.snapshot?.lastUpdatedAt}
        cutoffDate={matrix?.cutoff?.date}
        projected={calculateEndMonth}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onToggleProjection={setCalculateEndMonth}
      />

      <section className="rounded-2xl bg-card p-7 pb-5 shadow-sm">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <UiSearchInput
            id="wallet-matrix-search"
            showBorder
            placeholder="Buscar cliente, NIT, factura o ejecutivo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ModalFilterMatrix value={modalFilters} onChange={setModalFilters} />
        </div>

        {primeraCarga ? <StatCardsSkeleton /> : <WalletStatCards summary={summary} />}

        <div className="mt-7">
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
            // La tabla se renderiza siempre, incluso sin resultados: el
            // buscador vive arriba, y ocultar la tabla dejaría al usuario sin
            // forma de corregir o borrar lo que escribió.
            <ControlMatrix
              rows={clientRows}
              sort={sort}
              onSort={handleSort}
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
        </div>
      </section>

      {primeraCarga ? (
        <GroupsSkeleton />
      ) : (
        // Las recargas de grupos (drilldown, proyección) no vuelven al
        // skeleton: la tabla se queda y muestra el spinner en el cuerpo.
        <InvoiceGroups
          rows={groupRows}
          onOpenDetail={setOpenGroup}
          drilldown={drilldown}
          clienteNombre={clienteNombre}
          openGroup={openGroup}
          onClearDrilldown={() => setDrilldown(null)}
          loading={groupsLoading}
        />
      )}

      {/* Desde el modal se crean y editan novedades: al cerrar se releen los grupos. */}
      <GroupDetailModal
        detail={detalleAbierto}
        runId={matrix?.snapshot?.runId}
        onClose={() => {
          setOpenGroup(null);
          mutateGroups();
        }}
      />
    </div>
  );
}
