import { useCallback, useEffect, useRef, useState } from "react";

import { useMessageApi } from "@/context/MessageContext";
import { GenericResponse } from "@/types/global/IGlobal";

const POLL_INTERVAL_MS = 3000;
const REFRESH_TIMEOUT_MS = 5 * 60 * 1000;

/** Lo que el ciclo necesita del estado de una foto precalculada. */
export interface ISnapshotRefreshStatus {
  current: { runId: string; generatedAt: string } | null;
  lastFailed: { runId: string } | null;
  isRefreshing: boolean;
}

export interface ISnapshotRefreshMessages {
  /** Se pidió la actualización. */
  started: string;
  /** Ya había una en curso (409): se espera esa. */
  alreadyRunning: string;
  done: string;
  /** Falló la corrida pedida. */
  failed: string;
  /** Terminó la corrida ajena sin dejar foto nueva. */
  notCompleted: string;
  timeout: string;
  /** No se pudo pedir la actualización. */
  startFailed: string;
}

interface Options<S extends ISnapshotRefreshStatus> {
  /** Sin permiso para regenerar no se consulta el estado. */
  enabled: boolean;
  start: () => Promise<GenericResponse<{ runId: string }>>;
  getStatus: () => Promise<GenericResponse<S>>;
  /** Recarga lo que se ve con la foto nueva (o con la última disponible). */
  onDone: () => void;
  messages: ISnapshotRefreshMessages;
  timeoutMs?: number;
}

/**
 * Ciclo de un botón "Actualizar ahora" sobre una foto precalculada en el
 * backend (tabla de cartera, torre de recaudo).
 *
 * El refresh es asíncrono en el backend (202 + runId), así que se consulta
 * el estado cada pocos segundos hasta que:
 * - el run pedido quede vigente → éxito y se recarga (`onDone`);
 * - el run pedido falle → error; se sigue mostrando la versión anterior;
 * - pase el timeout → aviso y se recarga con lo último disponible.
 *
 * Si ya había una actualización en curso (409) se espera a que termine esa.
 */
export const useSnapshotRefresh = <S extends ISnapshotRefreshStatus>({
  enabled,
  start,
  getStatus,
  onDone,
  messages,
  timeoutMs = REFRESH_TIMEOUT_MS
}: Options<S>) => {
  const { showMessage } = useMessageApi();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<S | null>(null);

  // runId que se está esperando; null = se espera la corrida que otro disparó.
  const targetRunId = useRef<string | null>(null);
  const baselineRunId = useRef<string | null>(null);
  // Las funciones y textos llegan nuevos en cada render: van por ref para no
  // reiniciar los efectos.
  const latest = useRef({ start, getStatus, onDone, messages });
  latest.current = { start, getStatus, onDone, messages };

  const loadStatus = useCallback(async () => {
    const response = await latest.current.getStatus();
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
    const { messages: text } = latest.current;

    const poll = setInterval(async () => {
      try {
        const current = await loadStatus();
        const target = targetRunId.current;

        if (target) {
          if (current.current?.runId === target) {
            finish();
            latest.current.onDone();
            showMessage("success", text.done);
          } else if (current.lastFailed?.runId === target) {
            finish();
            showMessage("error", text.failed);
          }
          return;
        }

        // Esperando una corrida ajena: terminó cuando ya no hay nada en curso.
        if (!current.isRefreshing) {
          finish();
          latest.current.onDone();
          const hayNueva = current.current?.runId !== baselineRunId.current;
          showMessage(hayNueva ? "success" : "warning", hayNueva ? text.done : text.notCompleted);
        }
      } catch {
        // Un fallo puntual del estado no corta la espera; el timeout la cierra.
      }
    }, POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      finish();
      latest.current.onDone();
      showMessage("warning", text.timeout);
    }, timeoutMs);

    return () => {
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [refreshing, loadStatus, finish, showMessage, timeoutMs]);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    const { messages: text } = latest.current;
    setRefreshing(true);
    try {
      const response = await latest.current.start();
      targetRunId.current = response.data.runId;
      showMessage("info", text.started);
    } catch (error) {
      const apiError = error as { status?: number; data?: { runId?: string } };
      if (apiError?.status === 409) {
        // El 409 trae la corrida en curso: se espera esa.
        targetRunId.current = apiError.data?.runId ?? null;
        baselineRunId.current = status?.current?.runId ?? null;
        showMessage("info", text.alreadyRunning);
        return;
      }
      finish();
      showMessage("error", text.startFailed);
    }
  }, [refreshing, status, finish, showMessage]);

  return {
    refresh,
    refreshing,
    lastUpdatedAt: status?.current?.generatedAt ?? null
  };
};
