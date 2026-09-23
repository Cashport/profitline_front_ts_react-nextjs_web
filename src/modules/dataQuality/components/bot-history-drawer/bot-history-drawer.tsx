"use client";

import { Drawer } from "antd";
import { CheckCircle2, Clock, RotateCcw, TrendingUp, XCircle } from "lucide-react";

import { BOT_FILE_TYPE_META, BOT_MUTED_TEXT_COLOR, BOT_STATUS_META } from "../../constants";
import { IBotHealth, IBotRun } from "../../types/automations";

interface BotHistoryDrawerProps {
  bot: IBotHealth | null;
  isOpen: boolean;
  onClose: () => void;
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

function formatRunTimestamp(run: IBotRun | null) {
  return run ? `${run.date} · ${run.time}` : "Sin registro";
}

export function BotHistoryDrawer({ bot, isOpen, onClose }: BotHistoryDrawerProps) {
  const statusMeta = bot ? BOT_STATUS_META[bot.status] : null;
  // El historial viene con la corrida más reciente primero, así que find devuelve la última.
  const lastSuccess = bot?.history.find((run) => run.status === "success") ?? null;
  const lastError = bot?.history.find((run) => run.status === "error") ?? null;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      placement="right"
      width={480}
      destroyOnClose
      styles={{ body: { padding: 24 } }}
      title={
        bot && (
          <div>
            <h3 className="text-lg font-semibold text-cashport-black">{bot.name}</h3>
            <p className="text-sm font-normal" style={{ color: BOT_MUTED_TEXT_COLOR }}>
              {bot.client} · {bot.country} · {BOT_FILE_TYPE_META[bot.fileType].label}
            </p>
          </div>
        )
      }
    >
      {bot && statusMeta && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-2.5">
            <SummaryRow
              label="Última ejecución"
              value={`${bot.lastRun.date} · ${bot.lastRun.time}`}
              icon={<Clock className="h-3.5 w-3.5" />}
              iconColor={statusMeta.color}
              iconBg={statusMeta.bg}
            />
            <SummaryRow
              label="Última ejecución exitosa"
              value={formatRunTimestamp(lastSuccess)}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              iconColor={BOT_STATUS_META.success.color}
              iconBg={BOT_STATUS_META.success.bg}
            />
            <SummaryRow
              label="Última ejecución fallida"
              value={formatRunTimestamp(lastError)}
              icon={<XCircle className="h-3.5 w-3.5" />}
              iconColor={BOT_STATUS_META.error.color}
              iconBg={BOT_STATUS_META.error.bg}
            />
          </div>

          <div className="mb-6 rounded-lg border p-3" style={{ borderColor: "#DDDDDD" }}>
            <div className="mb-2.5 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" style={{ color: BOT_MUTED_TEXT_COLOR }} />
              <span className="text-sm font-medium text-cashport-black">Últimos 2 meses</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-cashport-black">{bot.last60Days.total}</p>
                <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                  Ejecuciones
                </p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: BOT_STATUS_META.success.color }}>
                  {bot.last60Days.success}
                </p>
                <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                  Exitosas
                </p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: BOT_STATUS_META.error.color }}>
                  {bot.last60Days.error}
                </p>
                <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                  Fallidas
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <h3 className="mb-4 text-sm font-semibold text-cashport-black">Historial de ejecuciones</h3>

      {bot && bot.history.length > 0 ? (
        <ol className="space-y-5">
          {bot.history.map((run, index) => {
            const isLast = index === bot.history.length - 1;
            const runMeta = BOT_STATUS_META[run.status];
            const Icon = runMeta.icon;

            return (
              <li key={`${run.date}-${run.time}-${index}`} className="relative flex gap-3 pl-1">
                {!isLast && (
                  <span
                    className="absolute bottom-[-20px] left-[13px] top-6 w-px"
                    style={{ backgroundColor: "#E5E7EB" }}
                  />
                )}
                <span
                  className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${runMeta.color}1A` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: runMeta.color }} />
                </span>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-cashport-black">
                      {run.status === "error" ? "Ejecución con errores" : "Ejecución exitosa"}
                    </span>
                    <span
                      className="flex shrink-0 items-center gap-1 text-xs"
                      style={{ color: BOT_MUTED_TEXT_COLOR }}
                    >
                      <RotateCcw className="h-3 w-3" />
                      {run.duration}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
                    {run.date} · {run.time}
                  </p>
                  {run.message && (
                    <p className="mt-1 text-xs" style={{ color: BOT_STATUS_META.error.color }}>
                      {run.message}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm" style={{ color: BOT_MUTED_TEXT_COLOR }}>
          Sin ejecuciones registradas para este bot.
        </p>
      )}
    </Drawer>
  );
}
