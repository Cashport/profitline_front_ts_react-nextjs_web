"use client";

import { Drawer, Spin } from "antd";

import { Badge } from "@/modules/chat/ui/badge";
import { IVariableHistoryEntry } from "@/types/dataQuality/IDataQuality";
import { formatLocalDateTimeParts } from "@/utils/utils";

import { BOT_MUTED_TEXT_COLOR } from "../../constants";
import { useVariableHistory } from "../../hooks/useVariableHistory";

interface VariableHistoryDrawerProps {
  archiveId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CHANGE_TYPE_META: Record<
  IVariableHistoryEntry["change_type"],
  { label: string; color: string; bg: string }
> = {
  CREATED: { label: "Creada", color: "#16A34A", bg: "#F0FDF4" },
  UPDATED: { label: "Actualizada", color: "#2143b0", bg: "#e2ecfe" },
  DELETED: { label: "Eliminada", color: "#DC2626", bg: "#FEF2F2" }
};

// Los valores se guardan en backend con JSON.stringify; se intenta mostrar el
// valor plano y si no es JSON válido (dato legado) se muestra tal cual llegó.
function formatValue(value: string | null): string {
  if (value == null) return "—";
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "string" ? parsed : JSON.stringify(parsed);
  } catch {
    return value;
  }
}

function formatTimestamp(isoDate: string) {
  const { date, time } = formatLocalDateTimeParts(isoDate);
  return `${date} · ${time}`;
}

export function VariableHistoryDrawer({ archiveId, isOpen, onClose }: VariableHistoryDrawerProps) {
  const { history, isLoading, error } = useVariableHistory(isOpen ? archiveId : null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      placement="right"
      width={420}
      destroyOnClose
      styles={{ body: { padding: 24 } }}
      title={<h3 className="text-lg font-semibold text-cashport-black">Historial de variables de configuración</h3>}
    >
      {isLoading && (
        <div className="flex justify-center py-6">
          <Spin size="small" />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm" style={{ color: CHANGE_TYPE_META.DELETED.color }}>
          No se pudo cargar el historial de variables. Intenta de nuevo más tarde.
        </p>
      )}

      {!isLoading && !error && history && history.length === 0 && (
        <p className="text-sm" style={{ color: BOT_MUTED_TEXT_COLOR }}>
          Sin cambios registrados para estas credenciales.
        </p>
      )}

      {!isLoading && !error && history && history.length > 0 && (
        <ol>
          {history.map((entry, index) => {
            const isLast = index === history.length - 1;
            const meta = CHANGE_TYPE_META[entry.change_type];

            return (
              <li key={entry.id} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute bottom-0 left-[3px] top-2 w-px"
                    style={{ backgroundColor: "#E5E7EB" }}
                  />
                )}
                <span
                  className="relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cashport-black">{entry.variable_key}</p>
                    <p className="mt-0.5 text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                      por {entry.changed_by_email || "usuario desconocido"} · {formatTimestamp(entry.created_at)}
                    </p>
                    {entry.change_type === "UPDATED" && (
                      <p className="mt-1 whitespace-pre-wrap break-words text-xs" style={{ color: "#141414" }}>
                        {formatValue(entry.old_value)} → {formatValue(entry.new_value)}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 text-xs"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Drawer>
  );
}
