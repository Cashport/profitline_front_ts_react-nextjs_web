"use client";

import { Drawer, Spin } from "antd";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  ImageOff,
  Loader2,
  Play,
  RotateCcw,
  TrendingUp
} from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";
import { formatLocalDateTimeParts } from "@/utils/utils";

import { BOT_MUTED_TEXT_COLOR, BOT_STATUS_META } from "../../constants";
import { useBotHistory } from "../../hooks/useBotHistory";

interface BotHistoryDrawerProps {
  bot: IBotStatusItem | null;
  isOpen: boolean;
  onClose: () => void;
  executingScheduleId: number | null;
  // eslint-disable-next-line no-unused-vars
  onRun: (bot: IBotStatusItem) => void;
  // eslint-disable-next-line no-unused-vars
  onClientClick: (bot: IBotStatusItem) => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

function SummaryRow({ label, value, icon, iconColor, iconBg }: SummaryRowProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
      style={{ borderColor: "#DDDDDD" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-cashport-black">{label}</span>
      </div>
      <span className="text-right text-sm" style={{ color: BOT_MUTED_TEXT_COLOR }}>
        {value}
      </span>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  tone?: "default" | "error";
}

function DetailRow({ label, value, tone = "default" }: DetailRowProps) {
  return (
    <div>
      <p className="text-xs font-medium" style={{ color: BOT_MUTED_TEXT_COLOR }}>
        {label}
      </p>
      <p
        className="mt-0.5 whitespace-pre-wrap break-words text-sm"
        style={{ color: tone === "error" ? BOT_STATUS_META.FALLIDO.color : "#141414" }}
      >
        {value}
      </p>
    </div>
  );
}

function formatTimestamp(isoDate: string | null, emptyLabel: string) {
  if (!isoDate) return emptyLabel;
  const { date, time } = formatLocalDateTimeParts(isoDate);
  return `${date} · ${time}`;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function BotHistoryDrawer({
  bot,
  isOpen,
  onClose,
  executingScheduleId,
  onRun,
  onClientClick
}: BotHistoryDrawerProps) {
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError
  } = useBotHistory(isOpen ? (bot?.schedule_id ?? null) : null);

  if (!bot) return null;

  const statusMeta = BOT_STATUS_META[bot.estado];
  const isRunning = bot.estado === "EN_EJECUCION" || executingScheduleId === bot.schedule_id;
  const canRun = !isRunning;
  const hasDiagnostics = Boolean(
    bot.error_legible ||
      bot.error ||
      bot.categoria_error ||
      bot.codigo_error ||
      bot.diagnostico ||
      bot.detalle_tecnico ||
      bot.paso_fallido ||
      bot.accion_requerida
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      placement="right"
      width={480}
      destroyOnClose
      styles={{ body: { padding: 24 } }}
      title={
        <div>
          <h3 className="text-lg font-semibold text-cashport-black">{bot.bot}</h3>
          <p className="text-sm font-normal" style={{ color: BOT_MUTED_TEXT_COLOR }}>
            {bot.cliente} · {bot.pais} · {bot.tipo_archivo}
          </p>
        </div>
      }
    >
      <div className="mb-5 grid grid-cols-1 gap-2.5">
        <SummaryRow
          label="Estado actual"
          value={statusMeta.label}
          icon={<statusMeta.icon className="h-3.5 w-3.5" />}
          iconColor={statusMeta.color}
          iconBg={statusMeta.bg}
        />
        <SummaryRow
          label="Última ejecución"
          value={formatTimestamp(bot.ultima_ejecucion, "Sin registro")}
          icon={<Clock className="h-3.5 w-3.5" />}
          iconColor={BOT_MUTED_TEXT_COLOR}
          iconBg="#F5F5F4"
        />
        <SummaryRow
          label="Próxima ejecución"
          value={formatTimestamp(bot.proxima_ejecucion, "Sin programar")}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          iconColor={BOT_MUTED_TEXT_COLOR}
          iconBg="#F5F5F4"
        />
        <SummaryRow
          label="Programación"
          value={bot.horario_descripcion || bot.cron_expression || "Sin definir"}
          icon={<Clock className="h-3.5 w-3.5" />}
          iconColor={BOT_MUTED_TEXT_COLOR}
          iconBg="#F5F5F4"
        />
      </div>

      <div className="mb-6 rounded-lg border p-3" style={{ borderColor: "#DDDDDD" }}>
        <div className="mb-2.5 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5" style={{ color: BOT_MUTED_TEXT_COLOR }} />
          <span className="text-sm font-medium text-cashport-black">Hoy</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-cashport-black">{bot.cantidad_ejecuciones}</p>
            <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
              Total histórico
            </p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: BOT_STATUS_META.EXITOSO.color }}>
              {bot.ejecuciones_hoy}
            </p>
            <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
              Ejecuciones hoy
            </p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: BOT_STATUS_META.FALLIDO.color }}>
              {bot.fallas_hoy}
            </p>
            <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
              Fallidas hoy
            </p>
          </div>
        </div>
      </div>

      {hasDiagnostics && (
        <div className="mb-6 rounded-lg border p-3" style={{ borderColor: "#DDDDDD" }}>
          <div className="mb-2.5 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" style={{ color: BOT_STATUS_META.FALLIDO.color }} />
            <span className="text-sm font-medium text-cashport-black">Diagnóstico</span>
          </div>
          <div className="space-y-3">
            {(bot.error_legible || bot.error) && (
              <DetailRow label="Mensaje de error" value={bot.error_legible || bot.error || ""} tone="error" />
            )}
            {bot.categoria_error && <DetailRow label="Categoría" value={bot.categoria_error} />}
            {bot.codigo_error && <DetailRow label="Código de error" value={bot.codigo_error} />}
            {bot.diagnostico && <DetailRow label="Diagnóstico" value={bot.diagnostico} />}
            {bot.paso_fallido && <DetailRow label="Paso fallido" value={bot.paso_fallido} />}
            {bot.accion_requerida && <DetailRow label="Acción requerida" value={bot.accion_requerida} />}
            {bot.detalle_tecnico && <DetailRow label="Detalle técnico" value={bot.detalle_tecnico} />}
          </div>
        </div>
      )}

      <h3 className="mb-4 text-sm font-semibold text-cashport-black">Historial de ejecuciones</h3>

      {isHistoryLoading && (
        <div className="flex justify-center py-6">
          <Spin size="small" />
        </div>
      )}

      {!isHistoryLoading && historyError && (
        <p className="text-sm" style={{ color: BOT_STATUS_META.FALLIDO.color }}>
          No se pudo cargar el historial de ejecuciones. Intenta de nuevo más tarde.
        </p>
      )}

      {!isHistoryLoading && !historyError && history && history.data.length === 0 && (
        <p className="text-sm" style={{ color: BOT_MUTED_TEXT_COLOR }}>
          Sin ejecuciones registradas para este bot.
        </p>
      )}

      {!isHistoryLoading && !historyError && history && history.data.length > 0 && (
        <ul className="divide-y" style={{ borderColor: "#EDEDED" }}>
          {history.data.map((run) => {
            const runMeta = BOT_STATUS_META[run.estado];

            return (
              <li key={run.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: runMeta.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cashport-black">
                      {formatTimestamp(run.fecha_inicio, "Sin fecha")}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                      <RotateCcw className="h-3 w-3 shrink-0" />
                      {`Duración: ${formatDuration(run.duracion_segundos)}`}
                    </p>
                    {run.error_legible && (
                      <p className="mt-1 text-xs" style={{ color: BOT_STATUS_META.FALLIDO.color }}>
                        {run.error_legible}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 gap-1 text-xs"
                  style={{ backgroundColor: runMeta.bg, color: runMeta.color }}
                >
                  {runMeta.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="mb-3 mt-6 text-sm font-semibold text-cashport-black">Evidencia</h3>
      {bot.evidencia_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bot.evidencia_url}
          alt="Evidencia del error"
          className="w-full rounded-lg border"
          style={{ borderColor: "#DDDDDD" }}
        />
      ) : (
        <div
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center"
          style={{ borderColor: "#DDDDDD" }}
        >
          <ImageOff className="h-5 w-5" style={{ color: BOT_MUTED_TEXT_COLOR }} />
          <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
            No hay evidencia disponible para esta ejecución.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Button disabled={!canRun} onClick={() => onRun(bot)} className="w-full">
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Ejecutar bot
        </Button>
        <Button variant="outline" className="w-full" onClick={() => onClientClick(bot)}>
          <ExternalLink className="h-4 w-4" />
          Ir a configuración del cliente
        </Button>
      </div>
    </Drawer>
  );
}

