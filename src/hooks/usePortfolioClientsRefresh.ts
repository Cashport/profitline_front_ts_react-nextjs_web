import { useCallback, useEffect, useRef, useState } from "react";

import { useMessageApi } from "@/context/MessageContext";
import {
  getPortfolioClientsStatus,
  refreshPortfolioClients
} from "@/services/portfolioClients/portfolioClients";
import { IPortfolioClientsSnapshotStatus } from "@/types/clients/IPortfolioClientsSnapshot";

const POLL_INTERVAL_MS = 3000;
const REFRESH_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Ciclo del botón "Recargar información" de la tabla de cartera.
 *
 * El refresh es asíncrono en el backend (202 + runId), así que se consulta
 * el estado cada pocos segundos hasta que:
 * - el run pedido quede vigente → éxito y se recarga la tabla (`onDone`);
 * - el run pedido falle → error; la tabla sigue mostrando la versión anterior;
 * - pase el timeout → aviso y se recarga con lo último disponible.
 *
 * Si ya había una actualización en curso (409) se espera a que termine esa.
 */
export const usePortfolioClientsRefresh = (enabled: boolean, onDone: () => void) => {
  const { showMessage } = useMessageApi();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<IPortfolioClientsSnapshotStatus | null>(null);

  // runId que se está esperando; null = se espera la corrida que otro disparó.
  const targetRunId = useRef<string | null>(null);
  const baselineRunId = useRef<string | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const loadStatus = useCallback(async () => {
    const response = await getPortfolioClientsStatus();
    setStatus(response.data);
    return response.data;
  }, []);

  // Fecha de la última actualización para el tooltip del botón.
  useEffect(() => {
    if (!enabled) return;
    loadStatus().catch(() => setStatus(null));
  }, [enabled, loadStatus]);

  const finish = useCallback(() => {
    setRefreshing(false);
    targetRunId.current = null;
    baselineRunId.current = null;
  }, []);

  useEffect(() => {
    if (!refreshing) return;

    const poll = setInterval(async () => {
      try {
        const current = await loadStatus();
        const target = targetRunId.current;

        if (target) {
          if (current.current?.runId === target) {
            finish();
            onDoneRef.current();
            showMessage("success", "Información de cartera actualizada");
          } else if (current.lastFailed?.runId === target) {
            finish();
            showMessage(
              "error",
              "No se pudo actualizar la información. Se mantiene la última versión disponible."
            );
          }
          return;
        }

        // Esperando una corrida ajena: terminó cuando ya no hay nada en curso.
        if (!current.isRefreshing) {
          finish();
          onDoneRef.current();
          const hayNueva = current.current?.runId !== baselineRunId.current;
          showMessage(
            hayNueva ? "success" : "warning",
            hayNueva
              ? "Información de cartera actualizada"
              : "La actualización en curso no se completó. Se mantiene la última versión disponible."
          );
        }
      } catch {
        // Un fallo puntual del estado no corta la espera; el timeout la cierra.
      }
    }, POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      finish();
      onDoneRef.current();
      showMessage(
        "warning",
        "La actualización está tardando más de lo esperado. Se muestra la última información disponible."
      );
    }, REFRESH_TIMEOUT_MS);

    return () => {
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [refreshing, loadStatus, finish, showMessage]);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const response = await refreshPortfolioClients();
      targetRunId.current = response.data.runId;
      showMessage("info", "Actualizando información de cartera…");
    } catch (error) {
      const apiError = error as { status?: number; data?: { runId?: string } };
      if (apiError?.status === 409) {
        // El 409 trae la corrida en curso: se espera esa.
        targetRunId.current = apiError.data?.runId ?? null;
        baselineRunId.current = status?.current?.runId ?? null;
        showMessage("info", "Ya hay una actualización en curso, se mostrará al terminar");
        return;
      }
      finish();
      showMessage("error", "No se pudo iniciar la actualización de la información");
    }
  }, [refreshing, status, finish, showMessage]);

  return {
    refresh,
    refreshing,
    lastUpdatedAt: status?.current?.generatedAt ?? null
  };
};
