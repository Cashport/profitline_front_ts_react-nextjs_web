"use client";

import { useState } from "react";
import { Input, Segmented } from "antd";
import { Download, Mail } from "lucide-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertDetail } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import { plural } from "../../utils/blocking-alerts";
import AlertModal from "../alert-modal/alert-modal";

type StatementFormat = "pdf" | "xlsx";
type StatementMode = "download" | "email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AccountStatementModalProps {
  detail: IBlockingAlertDetail;
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
  const total = (list: { amount: number }[]) => money(list.reduce((s, x) => s + x.amount, 0));
  const pastDue = detail.invoices.filter((i) => i.days_overdue > 0);
  const upcoming = detail.invoices.filter((i) => i.days_overdue <= 0);
  const sections = [
    {
      key: "past_due",
      label: "Facturas vencidas",
      meta: `${plural(pastDue.length, "factura", "facturas")} · ${total(pastDue)}`
    },
    {
      key: "upcoming",
      label: "Facturas por vencer",
      meta: `${plural(upcoming.length, "factura", "facturas")} · ${total(upcoming)}`
    },
    {
      key: "pending_balances",
      label: "Saldos pendientes",
      meta: `${plural(detail.pending_balances.length, "movimiento", "movimientos")} · ${total(detail.pending_balances)}`
    },
    {
      key: "credit_notes",
      label: "Notas crédito",
      meta: `${plural(detail.credit_notes.length, "nota", "notas")} · ${total(detail.credit_notes)}`
    }
  ];

  const included = sections.length - excluded.length;
  const ext = format === "pdf" ? "PDF" : "Excel";
  const badEmail = mode === "email" && to.trim() !== "" && !EMAIL.test(to.trim());
  const ready = included > 0 && (mode === "download" || EMAIL.test(to.trim()));

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
        <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-cp-ink-4">
          Incluir en el estado de cuenta
        </span>
        {sections.map((s) => {
          const on = !excluded.includes(s.key);
          return (
            <label
              key={s.key}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5",
                on ? "border-cp-lime-dark" : "border-cp-line-2"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{s.label}</span>
                <span className="block truncate text-[12px] text-cp-ink-3">{s.meta}</span>
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

      <Segmented<StatementFormat>
        block
        value={format}
        onChange={setFormat}
        options={[
          { label: "PDF", value: "pdf" },
          { label: "Excel", value: "xlsx" }
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            key: "download" as const,
            label: "Descargar",
            sub: "En este dispositivo",
            Icon: Download
          },
          {
            key: "email" as const,
            label: "Enviar por correo",
            sub: "Como adjunto al cliente",
            Icon: Mail
          }
        ].map(({ key, label, sub, Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-2 rounded-[12px] border bg-cp-surface p-3 text-left text-cp-ink",
              mode === key ? "border-cp-lime-dark" : "border-cp-line-2 hover:border-cp-ink-4"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                mode === key ? "bg-cp-lime text-[#141414]" : "bg-cp-muted text-cp-ink-3"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[13px] font-semibold">{label}</span>
              <span className="block text-[11.5px] text-cp-ink-3">{sub}</span>
            </span>
          </button>
        ))}
      </div>

      {mode === "email" && (
        <div className="flex flex-col gap-2">
          <Input
            type="email"
            addonBefore="Para"
            placeholder="correo@cliente.com"
            status={badEmail ? "error" : undefined}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Input
            type="email"
            addonBefore="CC"
            placeholder="Opcional"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
          />
          {badEmail && (
            <span className="text-[12px] text-cp-red">Escribe un correo válido para enviar.</span>
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
