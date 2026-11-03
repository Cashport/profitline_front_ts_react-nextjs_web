"use client";

import { useState } from "react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiTab from "@/components/ui/ui-tab";
import { useMessageApi } from "@/context/MessageContext";
import { sendDigitalRecord } from "@/services/accountingAdjustment/accountingAdjustment";
import { sendTemplate } from "@/services/chat/chat";
import type { IBlockingAlertsDetail } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import { MOBILE_TABS } from "../../constants";
import { useStatementContacts, useWhatsAppTemplate } from "../../hooks/use-blocking-alert-contacts";
import AlertModal from "../alert-modal/alert-modal";
import RecipientsField, { useRecipients } from "../recipients-field/recipients-field";

type Channel = "whatsapp" | "email";

/** Plantilla de WhatsApp del estado de cuenta: el back llena sus valores al enviar. */
const TEMPLATE = "estado_de_cuenta";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-[.12em] text-cp-ink-4";
const BUBBLE =
  "m-0 whitespace-pre-line rounded-[4px_12px_12px_12px] bg-cp-muted p-3 text-[13px] leading-relaxed";

interface SendToClientModalProps {
  detail: IBlockingAlertsDetail;
  onClose: () => void;
}

/**
 * Envía el estado de cuenta por WhatsApp (plantilla) o por correo a los contactos del
 * cliente. En un punto de venta también se pueden escribir otros destinatarios.
 */
export default function SendToClientModal({ detail, onClose }: SendToClientModalProps) {
  const { showMessage } = useMessageApi();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [sending, setSending] = useState(false);
  const contacts = useStatementContacts(detail.client.clientUuid);
  const template = useWhatsAppTemplate(TEMPLATE);
  const [phones, setPhones] = useRecipients(contacts.phones);
  const [emails, setEmails] = useRecipients(contacts.emails);

  const whatsapp = channel === "whatsapp";
  const manual = detail.pointOfSale !== null;
  const options = whatsapp ? contacts.phones : contacts.emails;
  const to = whatsapp ? phones : emails;
  const noContacts = !manual && !contacts.isLoading && options.length === 0;
  const noTemplate = whatsapp && !template.isLoading && !template.templateId;
  const channelLabel = whatsapp ? "WhatsApp" : "correo";

  const send = async () => {
    const { clientUuid } = detail.client;
    setSending(true);
    try {
      if (whatsapp) {
        await sendTemplate({
          templateId: template.templateId ?? TEMPLATE,
          clientUuid,
          destinationNumber: phones
        });
      } else {
        await sendDigitalRecord(clientUuid, {
          forward_to: emails.map((email) => ({ label: email, value: email })),
          subject: contacts.subject ?? ""
        });
      }
      showMessage("success", `Enviado por ${channelLabel} a ${to.join(", ")}`);
      onClose();
    } catch {
      showMessage("error", `No se pudo enviar por ${channelLabel}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <AlertModal onClose={onClose} title="Enviar al cliente" subtitle={detail.name}>
      <div className={cn("[&_.ant-tabs-nav]:!mb-0", MOBILE_TABS)}>
        <UiTab
          activeKey={channel}
          onChangeTab={(key) => setChannel(key as Channel)}
          tabs={[
            { key: "whatsapp", label: "WhatsApp", children: null },
            { key: "email", label: "Correo", children: null }
          ]}
        />
      </div>
      <div className="rounded-[14px] border border-cp-line bg-cp-bg px-3 py-1">
        <RecipientsField
          key={channel}
          kind={whatsapp ? "phone" : "email"}
          manual={manual}
          options={options}
          value={to}
          onChange={whatsapp ? setPhones : setEmails}
          loading={contacts.isLoading}
          placeholder={
            manual
              ? whatsapp
                ? "Contacto o número con indicativo (57…)"
                : "Contacto o correo"
              : "Elige un contacto"
          }
        />
      </div>
      {noContacts && (
        <span className="text-[12px] text-cp-orange max-md:text-[11.5px]">
          {detail.name} no tiene contactos con {channelLabel} para el estado de cuenta.
        </span>
      )}
      <div className="flex flex-col gap-2 rounded-[12px] border border-cp-line p-3">
        <span className={SECTION_LABEL}>
          {whatsapp ? "Plantilla · Estado de cuenta" : "Correo · Estado de cuenta"}
        </span>
        {whatsapp ? (
          <p className={BUBBLE}>
            {noTemplate
              ? `El proyecto no tiene la plantilla ${TEMPLATE} de WhatsApp.`
              : template.body ?? "Cargando plantilla…"}
          </p>
        ) : (
          <p className={BUBBLE}>
            {contacts.subject ? `${contacts.subject}\n` : ""}Le llega el estado de cuenta del
            cliente como adjunto.
          </p>
        )}
      </div>
      <PrincipalButton
        fullWidth
        disabled={to.length === 0 || noTemplate}
        loading={sending}
        onClick={send}
      >
        Enviar por {channelLabel}
      </PrincipalButton>
    </AlertModal>
  );
}
