"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Spin, message } from "antd";
import { Bot, Download, FileClock, RotateCcw, Trash2, Upload, User } from "lucide-react";

import { getFileHistory } from "@/services/dataQuality/dataQuality";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/modules/chat/ui/sheet";
import { IClientDetailArchiveClient, IFileHistoryEvent } from "@/types/dataQuality/IDataQuality";

dayjs.extend(timezone);
dayjs.extend(utc);

interface ModalFileHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  file: IClientDetailArchiveClient | null;
}

const eventIcons: Record<string, typeof Upload> = {
  created: Upload,
  updated: RotateCcw,
  deleted: Trash2
};

const getEventIcon = (eventType: string) => eventIcons[eventType] ?? FileClock;

const getEventColor = (eventType: string) => {
  if (eventType === "deleted") return "#DC2626";
  if (eventType === "created") return "#16A34A";
  return "#6B7280";
};

const formatDateTime = (isoDateString: string): string =>
  dayjs(isoDateString).tz("America/Bogota").format("YYYY-MM-DD HH:mm");

const bytesToMB = (bytes: number): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

export function ModalFileHistory({ isOpen, onClose, file }: ModalFileHistoryProps) {
  const [events, setEvents] = useState<IFileHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setEvents([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const history = await getFileHistory(file.id);
        // El orden no está garantizado por el contrato, así que se ordena por versión descendente.
        setEvents([...(history ?? [])].sort((a, b) => b.version - a.version));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el historial.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, file?.id]);

  const handleDownloadVersion = async (event: IFileHistoryEvent) => {
    if (!event.url_s3) return;
    const hide = message.open({
      type: "loading",
      content: "Descargando archivo...",
      duration: 0
    });
    try {
      const response = await fetch(event.url_s3);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", event.file_name || "archivo");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      message.error(
        err instanceof Error
          ? err.message
          : "Error al descargar el archivo. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="border-b p-6" style={{ borderColor: "#DDDDDD" }}>
          <SheetTitle className="text-lg" style={{ color: "#141414" }}>
            {file?.description}
          </SheetTitle>
          {file && (
            <div className="pt-1">
              <Badge
                variant="secondary"
                className="text-xs text-white"
                style={{ backgroundColor: file.data_type.color }}
              >
                {file.data_type.description}
              </Badge>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#141414" }}>
            Historial de versiones
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : events.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Sin eventos registrados para este archivo.
            </p>
          ) : (
            <ol className="space-y-5">
              {events.map((event, index) => {
                const EventIcon = getEventIcon(event.event_type);
                const eventColor = getEventColor(event.event_type);
                const isLast = index === events.length - 1;
                // El payload no trae actorType: sin usuario se asume evento del sistema.
                const isSystemEvent = !event.user_id && !event.user_name;
                const ActorIcon = isSystemEvent ? Bot : User;

                return (
                  <li key={event.id} className="relative flex gap-3 pl-1">
                    {!isLast && (
                      <span
                        className="absolute left-[13px] top-6 bottom-[-20px] w-px"
                        style={{ backgroundColor: "#E5E7EB" }}
                      />
                    )}
                    <span
                      className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${eventColor}1A` }}
                    >
                      <EventIcon className="h-3.5 w-3.5" style={{ color: eventColor }} />
                    </span>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium" style={{ color: "#141414" }}>
                          {event.event_description}
                          <span className="ml-2 text-xs font-normal" style={{ color: "#6B7280" }}>
                            v{event.version}
                          </span>
                        </span>
                        {event.url_s3 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            title="Descargar esta versión"
                            onClick={() => handleDownloadVersion(event)}
                          >
                            <Download className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
                          </Button>
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ color: "#6B7280" }}
                      >
                        <ActorIcon className="h-3 w-3" />
                        {isSystemEvent ? "Sistema" : event.user_name} ·{" "}
                        {formatDateTime(event.occurred_at)} · {bytesToMB(event.size_bytes)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
