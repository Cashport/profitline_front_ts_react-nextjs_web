"use client";

import { useState } from "react";
import { Drawer, Spin } from "antd";
import useSWR from "swr";
import { AlertTriangle, Image as ImageIcon, Loader2, Play, RotateCcw } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { FileDownloadModal } from "@/components/molecules/modals/FileDownloadModal/FileDownloadModal";
import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { formatLocalDateTimeParts } from "@/utils/utils";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IBotStatusItem,
  IClientDetail,
  IClientDetailDataArchive
} from "@/types/dataQuality/IDataQuality";

import { BOT_FREQUENCY_LABELS, BOT_MUTED_TEXT_COLOR, BOT_STATUS_META } from "../../constants";
import { useBotHistory } from "../../hooks/useBotHistory";
import { BotStatusBadge } from "../bots-table/bot-status-badge";
import { ModalDataIntake } from "../modal-data-intake";

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

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <p className="text-xs font-medium" style={{ color: BOT_MUTED_TEXT_COLOR }}>
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm" style={{ color: "#141414" }}>
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

// Texto sintetizado en frontend a partir de campos reales (tipo_archivo + periodicidad):
// el contrato de backend no tiene todavía un campo de descripción por bot.
function getBotDescription(bot: IBotStatusItem): string {
  const periodicidadLabel = bot.periodicidad
    .map((p) => (BOT_FREQUENCY_LABELS[p] ?? p).toLowerCase())
    .join(" y ");
  const tipo = bot.tipo_archivo || "archivo";
  return `Descarga el ${tipo}${periodicidadLabel ? ` ${periodicidadLabel}` : ""} del portal del cliente y lo carga en la plataforma.`;
}

export function BotHistoryDrawer({
  bot,
  isOpen,
  onClose,
  executingScheduleId,
  onRun,
  onClientClick
}: BotHistoryDrawerProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError
  } = useBotHistory(isOpen ? (bot?.schedule_id ?? null) : null);

  // Reutiliza el mismo endpoint de la ficha de cliente solo para ubicar (por
  // tipo_archivo) la ingesta ya configurada de este bot y poder abrir "Ver ingesta".
  const clientDetailKey =
    isOpen && bot ? `/data/client-detail/${bot.id_client_data}/${projectId}` : null;
  const { data: clientDetailResponse } = useSWR<GenericResponse<IClientDetail>>(
    clientDetailKey,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  const matchingIntake: IClientDetailDataArchive | null =
    clientDetailResponse?.data?.client_data_archives?.find(
      (archive) => archive.tipo_archivo === bot?.tipo_archivo
    ) ?? null;

  const openEvidence = (url: string) => {
    setEvidenceUrl(url);
    setIsEvidenceModalOpen(true);
  };

  if (!bot) return null;

  const isRunning = bot.estado === "EN_EJECUCION" || executingScheduleId === bot.schedule_id;
  const canRun = !isRunning;
  const hasError = Boolean(bot.error_legible || bot.error);
  const hasExtraDiagnostics = Boolean(
    bot.categoria_error ||
      bot.codigo_error ||
      bot.diagnostico ||
      bot.detalle_tecnico ||
      bot.paso_fallido ||
      bot.accion_requerida
  );

  return (
    <>
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
            <button
              type="button"
              onClick={() => onClientClick(bot)}
              className="text-left text-sm font-normal hover:underline"
              style={{ color: BOT_MUTED_TEXT_COLOR }}
            >
              {bot.cliente} · {bot.pais} · {bot.tipo_archivo}
              {bot.periodicidad.length > 0
                ? ` · ${bot.periodicidad.map((p) => BOT_FREQUENCY_LABELS[p] ?? p).join(", ")}`
                : ""}
            </button>
            <div className="mt-2">
              <BotStatusBadge status={bot.estado} />
            </div>
          </div>
        }
      >
        <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: "#F7F7F7" }}>
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color: BOT_MUTED_TEXT_COLOR }}
          >
            ¿Qué hace este bot?
          </p>
          <p className="text-sm" style={{ color: "#141414" }}>
            {getBotDescription(bot)}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: BOT_MUTED_TEXT_COLOR }}
            >
              Última ejecución
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "#141414" }}>
              {formatTimestamp(bot.ultima_ejecucion, "Sin registro")}
            </p>
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: BOT_MUTED_TEXT_COLOR }}
            >
              Próxima
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "#141414" }}>
              {formatTimestamp(bot.proxima_ejecucion, "Sin programar")}
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!matchingIntake}
            title={
              matchingIntake ? undefined : "No se encontró una ingesta configurada para este tipo de archivo"
            }
            onClick={() => setIsIntakeModalOpen(true)}
          >
            Ver ingesta
          </Button>
          <Button disabled={!canRun} onClick={() => onRun(bot)} className="flex-1">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Ejecutar ahora
          </Button>
        </div>

        {hasError && (
          <div
            className="mb-4 rounded-lg border p-3 text-sm"
            style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#991B1B" }}
          >
            <span className="font-semibold">Error: </span>
            {bot.error_legible || bot.error}
          </div>
        )}

        {hasExtraDiagnostics && (
          <div className="mb-6 rounded-lg border p-3" style={{ borderColor: "#DDDDDD" }}>
            <div className="mb-2.5 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: BOT_STATUS_META.FALLIDO.color }} />
              <span className="text-sm font-medium text-cashport-black">Diagnóstico</span>
            </div>
            <div className="space-y-3">
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
          <ol>
            {history.data.map((run, index) => {
              const isLast = index === history.data.length - 1;
              const runMeta = BOT_STATUS_META[run.estado];
              const outcomeLabel =
                run.estado === "FALLIDO"
                  ? `Falló${run.error_legible ? `: ${run.error_legible}` : ""}`
                  : run.estado === "EXITOSO"
                    ? `Completada · ${formatDuration(run.duracion_segundos)}`
                    : runMeta.label;

              return (
                <li key={run.id} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute bottom-0 left-[3px] top-2 w-px"
                      style={{ backgroundColor: "#E5E7EB" }}
                    />
                  )}
                  <span
                    className="relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: runMeta.color }}
                  />
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cashport-black">
                        {formatTimestamp(run.fecha_inicio, "Sin fecha")}
                      </p>
                      <p
                        className="mt-0.5 text-xs"
                        style={{
                          color: run.estado === "FALLIDO" ? BOT_STATUS_META.FALLIDO.color : BOT_MUTED_TEXT_COLOR
                        }}
                      >
                        {outcomeLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEvidence(run.evidencia_url || "")}
                        title="Ver evidencia"
                        className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-100"
                      >
                        <ImageIcon className="h-3.5 w-3.5" style={{ color: BOT_MUTED_TEXT_COLOR }} />
                      </button>
                      <Badge
                        variant="secondary"
                        className="gap-1 text-xs"
                        style={{ backgroundColor: runMeta.bg, color: runMeta.color }}
                      >
                        {runMeta.label}
                      </Badge>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Drawer>

      <FileDownloadModal
        isModalOpen={isEvidenceModalOpen}
        url={evidenceUrl}
        onCloseModal={setIsEvidenceModalOpen}
        title="Imagen"
      />

      {matchingIntake && (
        <ModalDataIntake
          open={isIntakeModalOpen}
          onOpenChange={() => setIsIntakeModalOpen(false)}
          mode="view"
          clientId={String(bot.id_client_data)}
          clientName={bot.cliente}
          idCountry={clientDetailResponse?.data?.id_country || 0}
          intakeData={matchingIntake}
          onSuccess={() => setIsIntakeModalOpen(false)}
        />
      )}
    </>
  );
}


