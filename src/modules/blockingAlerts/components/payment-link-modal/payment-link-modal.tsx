"use client";

import { useState } from "react";
import { Button, Segmented } from "antd";
import dayjs from "dayjs";
import { CircleCheck, Link2, Mail, MessageCircle, QrCode } from "lucide-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertDetail } from "@/types/blockingAlerts/IBlockingAlerts";

import { paymentLinkOf, plural } from "../../utils/blocking-alerts";
import AlertModal from "../alert-modal/alert-modal";

type PaymentMode = "past_due" | "selected";

interface PaymentLinkModalProps {
  detail: IBlockingAlertDetail;
  /** Facturas vencidas y las elegidas en el detalle. */
  pastDue: { count: number; total: number };
  selected: { count: number; total: number };
  onClose: () => void;
}

/**
 * Link de pago por lo vencido o por las facturas elegidas. Hasta que exista el
 * servicio, el link es de ejemplo y compartirlo solo avisa con un mensaje.
 */
export default function PaymentLinkModal({
  detail,
  pastDue,
  selected,
  onClose
}: PaymentLinkModalProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const { showMessage } = useMessageApi();
  const [mode, setMode] = useState<PaymentMode>("past_due");
  const [generated, setGenerated] = useState(false);

  const charge = mode === "past_due" ? pastDue : selected;
  const amount = formatMoney(charge.total, { hideDecimals: true });
  const link = paymentLinkOf(detail);
  const expires = dayjs().add(48, "hour").locale("es").format("D MMM · HH:mm").replace(".", "");

  const share = (channel: string) => {
    showMessage("success", `Link enviado por ${channel} a ${detail.contact_name}`);
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      showMessage("success", "Link copiado");
    } catch {
      showMessage("error", "No se pudo copiar el link");
    }
  };

  if (generated) {
    return (
      <AlertModal onClose={onClose} title="Link de pago" subtitle={detail.name}>
        <div className="flex flex-col items-center text-center">
          <CircleCheck className="h-11 w-11 text-cp-lime-dark" strokeWidth={1.8} />
          <span className="mt-2 text-[16px] font-semibold">Link listo para enviar</span>
          <span className="text-[22px] font-semibold tabular-nums">{amount}</span>
          <span className="text-[13px] text-cp-ink-3">Vence el {expires}</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-[10px] border border-cp-line-2 py-1.5 pl-3 pr-1.5">
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{link}</span>
          <Button size="small" onClick={copy}>
            Copiar
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "WhatsApp", Icon: MessageCircle, onClick: () => share("WhatsApp") },
            { label: "Correo", Icon: Mail, onClick: () => share("correo") },
            {
              label: "QR en tienda",
              Icon: QrCode,
              onClick: () =>
                showMessage("info", "El QR estará disponible al conectar el servicio de pagos")
            }
          ].map(({ label, Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex h-[62px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border border-cp-line-2 bg-cp-surface text-[13px] font-semibold text-cp-ink hover:border-cp-ink"
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          ))}
        </div>
        <Button block size="large" onClick={onClose}>
          Listo
        </Button>
      </AlertModal>
    );
  }

  return (
    <AlertModal
      onClose={onClose}
      title="Link de pago"
      subtitle={`${detail.name} · vigente 48 horas`}
    >
      <Segmented<PaymentMode>
        block
        value={mode}
        onChange={setMode}
        options={[
          { label: "Pago vencido", value: "past_due" },
          { label: "Facturas seleccionadas", value: "selected" }
        ]}
      />
      <div className="flex flex-col items-center gap-1 rounded-[12px] border border-cp-line bg-cp-subtle px-4 py-4 text-center">
        <span className="text-[13px] font-semibold text-cp-ink-4">
          Vas a cobrar
        </span>
        <span className="text-[28px] font-semibold leading-tight tabular-nums">{amount}</span>
        <span className="rounded-md bg-cp-muted px-2 py-0.5 text-[13px] font-semibold text-cp-ink-2">
          {plural(charge.count, "factura", "facturas")}
        </span>
      </div>
      <dl className="m-0 flex flex-col text-[13px]">
        {[
          ["Cliente", detail.name],
          ["Contacto", detail.contact_name],
          ["Vence el link", `${expires} (48 h)`]
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-3 border-b border-cp-line py-2 last:border-0"
          >
            <dt className="text-cp-ink-3">{label}</dt>
            <dd className="m-0 min-w-0 truncate font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <PrincipalButton
        fullWidth
        disabled={charge.total <= 0}
        icon={<Link2 className="h-4 w-4" />}
        onClick={() => setGenerated(true)}
      >
        Generar link de pago
      </PrincipalButton>
    </AlertModal>
  );
}
