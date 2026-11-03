"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiTab from "@/components/ui/ui-tab";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertDetail } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import { MOBILE_TABS } from "../../constants";
import { paymentLinkOf } from "../../utils/blocking-alerts";
import AlertModal from "../alert-modal/alert-modal";

type Channel = "whatsapp" | "email";

interface SendToClientModalProps {
  detail: IBlockingAlertDetail;
  onClose: () => void;
}

/** Plantilla de cobro con el link de pago y el estado de cuenta adjunto. */
export default function SendToClientModal({ detail, onClose }: SendToClientModalProps) {
  const t = useTranslations("blockingAlerts.sendToClient");
  const formatMoney = useAppStore((s) => s.formatMoney);
  const { showMessage } = useMessageApi();
  const [channel, setChannel] = useState<Channel>("whatsapp");

  const pastDue = detail.invoices.filter((i) => i.days_overdue > 0);
  const greeting = t("greeting", {
    contact: detail.contact_name.split("·")[0].trim(),
    company: detail.name
  });
  const message = pastDue.length
    ? [
        greeting,
        t("pastDueLine", {
          count: pastDue.length,
          amount: formatMoney(detail.past_due, { hideDecimals: true })
        }),
        t("payHere"),
        paymentLinkOf(detail),
        t("statementAttached")
      ].join("\n")
    : [greeting, t("statementAttachedToday")].join("\n");
  const channelLabel = channel === "whatsapp" ? "WhatsApp" : t("email");

  const send = () => {
    showMessage("success", t("sent", { channel: channelLabel, contact: detail.contact_name }));
    onClose();
  };

  return (
    <AlertModal
      onClose={onClose}
      title={t("title")}
      subtitle={t("to", { contact: detail.contact_name })}
    >
      <div className={cn("[&_.ant-tabs-nav]:!mb-0", MOBILE_TABS)}>
        <UiTab
          activeKey={channel}
          onChangeTab={(key) => setChannel(key as Channel)}
          tabs={[
            { key: "whatsapp", label: "WhatsApp", children: null },
            { key: "email", label: t("emailTab"), children: null }
          ]}
        />
      </div>
      <div className="flex flex-col gap-2 rounded-[12px] border border-cp-line p-3">
        <span className="text-[13px] font-semibold text-cp-ink-4">{t("template")}</span>
        <p className="m-0 whitespace-pre-line rounded-[4px_12px_12px_12px] bg-cp-muted p-3 text-[13px] leading-relaxed">
          {message}
        </p>
        <span className="flex w-fit items-center gap-1.5 rounded-lg bg-cp-muted px-2 py-1 text-[13px] font-semibold">
          <span className="text-[13px] text-cp-orange">PDF</span>
          estado_cuenta.pdf
        </span>
      </div>
      <PrincipalButton fullWidth onClick={send}>
        {t("sendBy", { channel: channelLabel })}
      </PrincipalButton>
    </AlertModal>
  );
}
