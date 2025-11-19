"use client";
import { getIdToken } from "@/utils/api/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo
} from "react";
import { io, Socket } from "socket.io-client";
import * as globalConfig from "@/config";

// Types
import { IMessageSocket, ITicketUpdate } from "@/types/chat/IChat";
interface SocketConfig {
  userId: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: IMessageSocket[];
  stats: {
    activeTickets: number;
    totalMessages: number;
  };
  // eslint-disable-next-line no-unused-vars
  connect: (config: SocketConfig) => Promise<void>;
  disconnect: () => void;
  // eslint-disable-next-line no-unused-vars
  connectTicketRoom: (ticketId: string) => Promise<void>;
  // Functions to make something when a new message or ticket arrives
  // eslint-disable-next-line no-unused-vars
  subscribeToMessages: (callback: (message: IMessageSocket) => void) => () => void;
  // eslint-disable-next-line no-unused-vars
  subscribeToTickets: (callback: (ticket: any) => void) => () => void;
  // eslint-disable-next-line no-unused-vars
  subscribeToTicketUpdates: (callback: (ticket: ITicketUpdate) => void) => () => void;
  // eslint-disable-next-line no-unused-vars
  desubscribeTicketRoom: (ticketRoomId: string) => void;
}

// Socket Context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Custom Hook optimizado
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Hook especializado para mensajes con callback personalizado
// eslint-disable-next-line no-unused-vars
export const useSocketMessages = (onNewMessage?: (message: IMessageSocket) => void) => {
  const { messages, subscribeToMessages } = useSocket();

  useEffect(() => {
    if (!onNewMessage) return;

    return subscribeToMessages(onNewMessage);
  }, [onNewMessage, subscribeToMessages]);

  return messages;
};

// Socket Manager optimizado
class SocketManager {
  private socket: Socket | null = null;
  // eslint-disable-next-line no-unused-vars
  private messageCallbacks = new Set<(message: IMessageSocket) => void>();
  // eslint-disable-next-line no-unused-vars
  private ticketCallbacks = new Set<(ticket: any) => void>();
  // eslint-disable-next-line no-unused-vars
  private ticketUpdateCallbacks = new Set<(ticket: ITicketUpdate) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private isConnect = false;

  async connect(config: SocketConfig): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = (await getIdToken(false)) as string;
    if (!token) {
      throw new Error("Authentication token required");
    }

    this.socket = io(globalConfig.default.API_CHAT?.slice(0, -3), {
      timeout: 20000,
      forceNew: false, // Reusar conexión si es posible
      reconnection: true,
      reconnectionDelay: Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000), // Backoff exponencial
      reconnectionAttempts: this.maxReconnectAttempts,
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` }
    });

    this.isConnect = true;

    this.setupEventListeners(config);
    return this.socket;
  }

  private setupEventListeners(config: SocketConfig) {
    if (!this.socket || !this.isConnect) return;

    // Eventos de conexión
    this.socket.on("connect", () => {
      console.info("Connected to chat socket server");
      this.reconnectAttempts = 0; // Reset counter on successful connection

      this.socket?.emit("join-user-room", config.userId);
    });

    // Eventos de mensajes - usar callbacks optimizados
    this.socket.on("new-message", (data: IMessageSocket) => {
      this.messageCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("new-ticket", (data: any) => {
      this.ticketCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("ticket-updated", (data: ITicketUpdate) => {
      this.ticketUpdateCallbacks.forEach((callback) => callback(data));
    });

    // Manejar errores de reconexión
    this.socket.on("reconnect_failed", () => {
      this.reconnectAttempts = this.maxReconnectAttempts;
    });
  }

  // eslint-disable-next-line no-unused-vars
  subscribeToMessages(callback: (message: IMessageSocket) => void): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  // eslint-disable-next-line no-unused-vars
  subscribeToTickets(callback: (ticket: any) => void): () => void {
    this.ticketCallbacks.add(callback);
    return () => this.ticketCallbacks.delete(callback);
  }

  // eslint-disable-next-line no-unused-vars
  subscribeToTicketUpdates(callback: (ticket: ITicketUpdate) => void): () => void {
    this.ticketUpdateCallbacks.add(callback);
    return () => this.ticketUpdateCallbacks.delete(callback);
  }

  desubscribeToTicketRoom(ticketRoomId: string) {
    if (this.socket?.connected) {
      console.info("Desubscribed from ticket room TOP:", ticketRoomId);
      this.socket.emit("leave-ticket-room", ticketRoomId);
    }
  }

  async joinTicketRoom(ticketId: string): Promise<void> {
    return new Promise(() => {
      if (!this.socket?.connected) {
        return;
      }
      this.socket.emit("join-ticket-room", ticketId);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // Limpiar callbacks
    this.messageCallbacks.clear();
    this.ticketCallbacks.clear();
    this.ticketUpdateCallbacks.clear();
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Socket Provider optimizado
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados optimizados con lazy initialization
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<IMessageSocket[]>(() => []);
  const [stats, setStats] = useState(() => ({ activeTickets: 0, totalMessages: 0 }));

  // Socket manager singleton
  const socketManager = useRef<SocketManager | null>(null);

  // Initialize socket manager only once
  if (!socketManager.current) {
    socketManager.current = new SocketManager();
  }

  // Optimized message handler
  const handleNewMessage = useCallback((data: IMessageSocket) => {
    setMessages((prev) => {
      // Evitar duplicados
      if (prev.some((msg) => msg.id === data.id)) return prev;
      return [...prev, data];
    });
    setStats((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
  }, []);

  // Optimized ticket handler
  // eslint-disable-next-line no-unused-vars
  const handleNewTicket = useCallback((data: any) => {
    setStats((prev) => ({ ...prev, activeTickets: prev.activeTickets + 1 }));
  }, []);

  const connect = useCallback(
    async (config: SocketConfig) => {
      try {
        const socket = await socketManager.current!.connect(config);

        // Subscribe to events only once
        socketManager.current!.subscribeToMessages(handleNewMessage);
        socketManager.current!.subscribeToTickets(handleNewTicket);

        // Monitor connection status
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => {
          console.warn("Disconnected from chat socket server");
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Failed to connect:", error);
        throw error;
      }
    },
    [handleNewMessage, handleNewTicket]
  );

  // Optimized ticket room connection
  const connectTicketRoom = useCallback(async (ticketId: string) => {
    if (!socketManager.current) {
      throw new Error("Socket manager not initialized");
    }
    return socketManager.current.joinTicketRoom(ticketId);
  }, []);

  const disconnect = useCallback(() => {
    socketManager.current?.disconnect();
    setIsConnected(false);
  }, []);

  // Subscription functions for external components
  // eslint-disable-next-line no-unused-vars
  const subscribeToMessages = useCallback((callback: (message: IMessageSocket) => void) => {
    return socketManager.current?.subscribeToMessages(callback) ?? (() => {});
  }, []);

  // eslint-disable-next-line no-unused-vars
  const subscribeToTickets = useCallback((callback: (ticket: any) => void) => {
    return socketManager.current?.subscribeToTickets(callback) ?? (() => {});
  }, []);

  // eslint-disable-next-line no-unused-vars
  const subscribeToTicketUpdates = useCallback((callback: (ticket: ITicketUpdate) => void) => {
    return socketManager.current?.subscribeToTicketUpdates(callback) ?? (() => {});
  }, []);

  const desubscribeTicketRoom = useCallback((ticketRoomId: string) => {
    return socketManager.current?.desubscribeToTicketRoom(ticketRoomId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketManager.current?.disconnect();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    (): SocketContextType => ({
      socket: socketManager.current?.getSocket() ?? null,
      isConnected,
      messages,
      stats,
      connect,
      disconnect,
      connectTicketRoom,
      subscribeToMessages,
      subscribeToTickets,
      subscribeToTicketUpdates,
      desubscribeTicketRoom
    }),
    [
      isConnected,
      messages,
      stats,
      connect,
      disconnect,
      connectTicketRoom,
      subscribeToMessages,
      subscribeToTickets,
      subscribeToTicketUpdates,
      desubscribeTicketRoom
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
