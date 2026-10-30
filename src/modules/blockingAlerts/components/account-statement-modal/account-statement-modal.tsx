"use client";

import { useState } from "react";
import { Input } from "antd";
import { Download, Mail } from "lucide-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiTab from "@/components/ui/ui-tab";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertsDetail } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import { MOBILE_TABS } from "../../constants";
import { fmtDay, plural } from "../../utils/blocking-alerts";
import AlertModal from "../alert-modal/alert-modal";

type StatementFormat = "pdf" | "xlsx";
type StatementMode = "download" | "email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_LABEL =
  "w-12 shrink-0 text-[12px] font-medium text-cp-ink-4 max-md:w-11 max-md:text-[11px]";
const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-[.12em] text-cp-ink-4 max-md:text-[10px]";

interface AccountStatementModalProps {
  detail: IBlockingAlertsDetail;
  onClose: () => void;
}

/** Estado de cuenta: qué incluir, formato y si se descarga o se envía por correo. */
export default function AccountStatementModal({ detail, onClose }: AccountStatementModalProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const { showMessage } = useMessageApi();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [format, setFormat] = useState<StatementFormat>("pdf");
  const [mode, setMode] = useState<StatementMode>("download");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");

  const money = (value: number) => formatMoney(value, { hideDecimals: true });
  const { all, past_due: pastDue, balances, credit_notes: creditNotes } = detail.tabs;
  const upcoming = { count: all.count - pastDue.count, total: all.total - pastDue.total };
  const sections = [
    {
      key: "past_due",
      label: "Facturas vencidas",
      meta: `${plural(pastDue.count, "factura", "facturas")} · ${money(pastDue.total)}`
    },
    {
      key: "upcoming",
      label: "Facturas por vencer",
      meta: `${plural(upcoming.count, "factura", "facturas")} · ${money(upcoming.total)}`
    },
    {
      key: "pending_balances",
      label: "Saldos pendientes",
      meta: `${plural(balances.count, "movimiento", "movimientos")} · ${money(balances.total)}`
    },
    {
      key: "credit_notes",
      label: "Notas crédito",
      meta: `${plural(creditNotes.count, "nota", "notas")} · ${money(creditNotes.total)}`
    }
  ];

  const included = sections.length - excluded.length;
  const ext = format === "pdf" ? "PDF" : "Excel";
  const badEmail = mode === "email" && to.trim() !== "" && !EMAIL.test(to.trim());
  const ready = included > 0 && (mode === "download" || EMAIL.test(to.trim()));
  // "estado_cuenta_oxxo_colombia.xlsx": nombre sin tildes ni símbolos.
  const fileName = `estado_cuenta_${detail.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}.${format}`;

  const submit = () => {
    showMessage(
      "success",
      mode === "download"
        ? `Descargando el estado de cuenta de ${detail.name} (${ext})`
        : `Estado de cuenta enviado a ${to.trim()}`
    );
    onClose();
  };

  return (
    <AlertModal onClose={onClose} title="Estado de cuenta" subtitle={detail.name}>
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Incluir en el estado de cuenta</span>
        <div className="flex flex-col gap-2">
          {sections.map((s) => {
            const on = !excluded.includes(s.key);
            return (
              <label
                key={s.key}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2 max-md:py-1.5",
                  on ? "border-cp-lime-dark" : "border-cp-line-2"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold max-md:text-[12.5px]">
                    {s.label}
                  </span>
                  <span className="block truncate text-[12px] text-cp-ink-3 max-md:text-[11px]">
                    {s.meta}
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer accent-cp-lime"
                  checked={on}
                  onChange={() =>
                    setExcluded(on ? [...excluded, s.key] : excluded.filter((k) => k !== s.key))
                  }
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className={cn("[&_.ant-tabs-nav]:!mb-0", MOBILE_TABS)}>
        <UiTab
          activeKey={format}
          onChangeTab={(key) => setFormat(key as StatementFormat)}
          tabs={[
            { key: "pdf", label: "PDF", children: null },
            { key: "xlsx", label: "Excel", children: null }
          ]}
        />
      </div>

      <span className={SECTION_LABEL}>¿Qué quieres hacer?</span>
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            key: "download" as const,
            label: "Descargar",
            sub: "Guárdalo en este dispositivo",
            Icon: Download
          },
          {
            key: "email" as const,
            label: "Enviar por correo",
            sub: "Le llega al cliente como adjunto",
            Icon: Mail
          }
        ].map(({ key, label, sub, Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-1.5 rounded-[12px] border bg-cp-surface px-3 py-2.5 text-left text-cp-ink max-md:gap-1 max-md:py-2",
              mode === key ? "border-cp-lime-dark" : "border-cp-line-2 hover:border-cp-ink-4"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full max-md:h-7 max-md:w-7",
                mode === key ? "bg-cp-lime text-[#141414]" : "bg-cp-muted text-cp-ink-3"
              )}
            >
              <Icon className="h-4 w-4 max-md:h-3.5 max-md:w-3.5" />
            </span>
            <span>
              <span className="block text-[13px] font-semibold max-md:text-[12.5px]">{label}</span>
              <span className="block text-[11.5px] leading-snug text-cp-ink-3 max-md:text-[10.5px]">
                {sub}
              </span>
            </span>
          </button>
        ))}
      </div>

      {mode === "email" && (
        <div className="flex flex-col gap-2">
          <div className="rounded-[14px] border border-cp-line bg-cp-bg px-3 py-1">
            {[
              { label: "Para", value: to, onChange: setTo, placeholder: "correo@cliente.com" },
              { label: "CC", value: cc, onChange: setCc, placeholder: "Opcional" }
            ].map((field) => (
              <label
                key={field.label}
                className="flex min-h-[44px] items-center gap-2.5 border-b border-cp-line max-md:min-h-[38px]"
              >
                <span className={FIELD_LABEL}>{field.label}</span>
                <Input
                  type="email"
                  variant="borderless"
                  aria-label={field.label}
                  placeholder={field.placeholder}
                  status={field.label === "Para" && badEmail ? "error" : undefined}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="!px-0 !text-[13px] max-md:!text-[12.5px]"
                />
              </label>
            ))}
            <div className="flex items-start gap-2.5 py-3 max-md:py-2">
              <span className={FIELD_LABEL}>Asunto</span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-cp-ink max-md:text-[12px]">
                Estado de cuenta · {detail.name} · corte {fmtDay(detail.cutoffAt, true)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-[11px] bg-cp-muted px-3 py-2.5 max-md:py-2">
            <span className="shrink-0 text-[10px] font-bold text-cp-orange">
              {format === "pdf" ? "PDF" : "XLS"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-cp-ink max-md:text-[11.5px]">
              {fileName}
            </span>
            <span className="shrink-0 text-[11px] text-cp-ink-4">Adjunto</span>
          </div>
          {badEmail && (
            <span className="text-[12px] text-cp-red max-md:text-[11.5px]">
              Escribe un correo válido para enviar.
            </span>
          )}
        </div>
      )}

      <PrincipalButton
        fullWidth
        disabled={!ready}
        icon={mode === "download" ? <Download className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
        onClick={submit}
      >
        {!included
          ? "Elige qué incluir"
          : mode === "download"
            ? `Descargar estado de cuenta · ${ext}`
            : "Enviar estado de cuenta"}
      </PrincipalButton>
    </AlertModal>
  );
}
