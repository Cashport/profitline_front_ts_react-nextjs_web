"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { getIdToken } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import * as globalConfig from "@/config";

interface WalletMatrixSocketContextType {
  isConnected: boolean;
  /** Se incrementa cada vez que termina una actualización de la matriz. */
  refreshedAt: number;
  isRefreshing: boolean;
}

const WalletMatrixSocketContext = createContext<WalletMatrixSocketContextType>({
  isConnected: false,
  refreshedAt: 0,
  isRefreshing: false
});

/**
 * Avisa a la pantalla cuando el worker termina de regenerar la matriz.
 *
 * Es una optimización, no la fuente de verdad: el refresh manual responde
 * de inmediato y sigue en background, así que si el evento no llega —el
 * usuario puede estar conectado a otra réplica del backend— el hook de
 * estado hace polling y la pantalla se entera igual. Por eso este contexto
 * nunca bloquea ni muestra errores propios.
 */
export const WalletMatrixSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const token = (await getIdToken(false)) as string;
        if (cancelled) return;

        const socket = io(globalConfig.default.API_HOST?.replace(/\/api\/?$/, ""), {
          auth: { token },
          transports: ["websocket"],
          reconnectionAttempts: 5
        });

        socket.on("connect", () => {
          setIsConnected(true);
          socket.emit("wallet-matrix:join", projectId);
        });
        socket.on("disconnect", () => setIsConnected(false));
        socket.on("wallet-matrix:started", () => setIsRefreshing(true));
        socket.on("wallet-matrix:done", () => {
          setIsRefreshing(false);
          setRefreshedAt(Date.now());
        });
        socket.on("wallet-matrix:failed", () => setIsRefreshing(false));
        // Si el socket no puede conectarse no se rompe nada: queda el
        // polling del endpoint de estado como respaldo.
        socket.on("connect_error", () => setIsConnected(false));

        socketRef.current = socket;
      } catch {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.emit("wallet-matrix:leave", projectId);
      disconnect();
    };
  }, [projectId, disconnect]);

  return (
    <WalletMatrixSocketContext.Provider value={{ isConnected, refreshedAt, isRefreshing }}>
      {children}
    </WalletMatrixSocketContext.Provider>
  );
};

export const useWalletMatrixSocket = () => useContext(WalletMatrixSocketContext);
