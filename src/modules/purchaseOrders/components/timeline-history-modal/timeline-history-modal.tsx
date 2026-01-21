"use client";

import { X, MessageSquare, Settings, FileText } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { useEffect, useState } from "react";
import { getHistoryTimelineEvents } from "@/services/purchaseOrders/purchaseOrders";
import { IHistoryTimelineEvent } from "@/types/purchaseOrders/purchaseOrders";

interface TimelineHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId?: string;
}

export function TimelineHistoryModal({
  isOpen,
  onClose,
  purchaseOrderId
}: TimelineHistoryModalProps) {
  const [events, setEvents] = useState<IHistoryTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!purchaseOrderId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await getHistoryTimelineEvents(purchaseOrderId);
        setEvents(res);
      } catch (err) {
        console.error("Error fetching timeline events:", err);
        setError("Error al cargar el historial");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [purchaseOrderId, isOpen]);

  if (!isOpen) return null;

  const getEventIcon = (event: IHistoryTimelineEvent) => {
    if (event.step_icon === "file-text") {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (event.is_novelty === 1) {
      return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
    return <Settings className="h-4 w-4 text-gray-600" />;
  };

  const getEventBadgeColor = (event: IHistoryTimelineEvent) => {
    if (event.is_novelty === 1) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historial completo</h2>
            <p className="text-sm text-gray-500 mt-0.5">OC {purchaseOrderId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">No hay eventos en el historial</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Trazabilidad</h3>

                <div className="relative">
                  <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-gray-300"></div>

                  <div className="space-y-6">
                    {events.map((event, index) => {
                      const { date, time } = formatDate(event.created_at);
                      const isLast = index === events.length - 1;

                      return (
                        <div key={event.id} className="relative pl-12">
                          <div className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow-sm">
                            {getEventIcon(event)}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-sm font-medium text-yellow-600">●</span>
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {event.step_name}
                                </h4>
                              </div>
                              {event.novelty_type_name && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0 bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  Abierta
                                </Badge>
                              )}
                            </div>

                            <div className="text-xs text-gray-500 mb-2">
                              {date} {time}
                            </div>

                            {event.created_by_name && (
                              <div className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Acción:</span> {event.created_by_name}
                              </div>
                            )}

                            {event.event_description && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Comentario:</span>{" "}
                                {event.event_description}
                              </div>
                            )}

                            {event.novelty_type_name && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Tipo novedad:</span>{" "}
                                  {event.novelty_type_name}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total de eventos:</span>
              <span className="font-medium text-gray-900">{events.length}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
