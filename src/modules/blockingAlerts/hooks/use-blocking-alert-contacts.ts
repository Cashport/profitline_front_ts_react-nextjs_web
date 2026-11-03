import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { getDigitalRecordFormInfo } from "@/services/accountingAdjustment/accountingAdjustment";
import { getWhatsAppTemplates } from "@/services/chat/chat";

import type { RecipientOption } from "../components/recipients-field/recipients-field";

const SWR_OPTIONS = { revalidateOnFocus: false };

const unique = (options: RecipientOption[]) =>
  options.filter((o, i) => options.findIndex((x) => x.value === o.value) === i);

/**
 * Contactos del estado de cuenta del cliente: los cargos que el proyecto configuró para
 * el acta digital. Un contacto sin correo o con el teléfono inactivo no sale en ese canal.
 */
export const useStatementContacts = (clientUuid: string) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const { data, isLoading } = useSWR(
    projectId ? ["/client/digital-record", projectId, clientUuid] : null,
    ([, id]: [string, number]) => getDigitalRecordFormInfo(id, clientUuid),
    SWR_OPTIONS
  );
  const users = data?.usuarios ?? [];
  return {
    emails: unique(
      users
        .filter((u) => u.value)
        .map((u) => ({ label: `${u.label} · ${u.value}`, value: u.value }))
    ),
    phones: unique(
      users
        .filter((u) => u.full_phone && !u.full_phone.includes("INACTIVE"))
        .map((u) => ({ label: `${u.label} · +${u.full_phone}`, value: u.full_phone }))
    ),
    subject: data?.asunto,
    isLoading
  };
};

/** Una plantilla de WhatsApp del proyecto y su cuerpo, como la muestra el chat. */
export const useWhatsAppTemplate = (name: string) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const { data, isLoading } = useSWR(
    projectId ? ["/whatsapp-templates", projectId] : null,
    () => getWhatsAppTemplates(),
    SWR_OPTIONS
  );
  const template = data?.find((t) => t.id === name || t.name === name);
  return {
    templateId: template?.id,
    body: template?.components.find((c) => c.type === "BODY")?.text,
    isLoading
  };
};
