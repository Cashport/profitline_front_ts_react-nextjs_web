import { formatNumber } from "@/utils/utils";
import { ApiError } from "@/utils/api/api";
import {
  IUser,
  changeStatusInvoice,
  radicateInvoice,
  reportInvoiceIncident,
  sendDigitalRecord
} from "@/services/accountingAdjustment/accountingAdjustment";
import { addItemsToTable } from "@/services/applyTabClients/applyTabClients";
import { downloadDigitalRecordFiles, sendDigitalRecordWhatsapp } from "@/services/chat/clients";
import { IBulkActionConfig } from "./types";

// Por ahora sólo se radica por correo, igual que desde el modal de radicación
const RADICATION_TYPE_EMAIL = "1";

interface IRunBulkActionParams {
  config: IBulkActionConfig;
  /** Facturas encontradas dentro del alcance. El estado de cuenta no las usa. */
  invoiceIds: number[];
  /** Estado de cuenta: contactos del cliente, para enviar el correo o teléfono de los elegidos. */
  contacts: IUser[];
  clientUUID: string;
  projectId: number;
  /** Registrar novedad: la crea aunque alguna factura ya tenga una abierta. */
  createNewIncident?: boolean;
}

// Cada contacto elegido se envía con su correo o su teléfono; lo escrito a mano va tal cual
const toDestinations = (recipients: string[], contacts: IUser[], field: "value" | "full_phone") =>
  recipients.map((recipient) => {
    const contact = contacts.find((user) => String(user.contact_id) === recipient);
    return contact ? contact[field] : recipient.trim();
  });

// El estado de cuenta es del cliente, no de las facturas elegidas
const sendAccountStatement = async (
  config: IBulkActionConfig,
  contacts: IUser[],
  clientUUID: string
): Promise<string> => {
  switch (config.statementMethod) {
    case "correo":
      await sendDigitalRecord(clientUUID, {
        forward_to: toDestinations(config.recipients, contacts, "value").map((email) => ({
          value: email,
          label: email
        })),
        subject: ""
      });
      return "Estado de cuenta enviado por correo.";

    case "whatsapp":
      await sendDigitalRecordWhatsapp(
        clientUUID,
        toDestinations(config.recipients, contacts, "full_phone").map(Number)
      );
      return "Estado de cuenta enviado por WhatsApp.";

    case "descargar": {
      // El servicio devuelve null en vez de lanzar el error
      const files = await downloadDigitalRecordFiles(clientUUID);
      if (!files) throw new Error("No se pudieron descargar los archivos del estado de cuenta.");

      files.forEach((file) => window.open(file.url, "_blank"));
      return "Archivos del estado de cuenta descargados.";
    }
  }
};

/**
 * Ejecuta la acción con los mismos servicios que sus modales de una factura. Devuelve el texto
 * del resumen.
 */
export const runBulkAction = async ({
  config,
  invoiceIds,
  contacts,
  clientUUID,
  projectId,
  createNewIncident
}: IRunBulkActionParams): Promise<string> => {
  const invoices = `${formatNumber(invoiceIds.length)} facturas`;

  switch (config.action) {
    case "estado": {
      const response = await changeStatusInvoice(
        config.newStatus ?? "",
        invoiceIds,
        config.comment,
        null,
        projectId,
        clientUUID
      );
      return response?.data?.message || `Se cambió el estado de ${invoices}.`;
    }

    case "pago":
      await addItemsToTable(projectId, clientUUID, "invoices", invoiceIds);
      return `Se agregaron ${invoices} a la tabla de aplicación de pagos.`;

    case "novedad":
      await reportInvoiceIncident(
        invoiceIds,
        config.comment,
        String(config.motiveId),
        null,
        clientUUID,
        String(projectId),
        config.noveltyAmount ?? undefined,
        createNewIncident
      );
      return `Se registró la novedad en ${invoices}.`;

    case "radicar":
      await radicateInvoice(
        {
          invoices_id: invoiceIds,
          radication_type: RADICATION_TYPE_EMAIL,
          accept_date: config.radicationDate?.format("YYYY-MM-DD") ?? "",
          comments: config.comment || undefined
        },
        config.evidence,
        clientUUID
      );
      return `Se radicaron ${invoices}.`;

    case "estado_cta":
      return sendAccountStatement(config, contacts, clientUUID);
  }
};

// Registrar novedad: el backend responde 500 cuando alguna factura ya tiene una novedad abierta
export const hasActiveIncidents = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 500 &&
  Array.isArray(error.data?.activeIncidentDocuments) &&
  error.data.activeIncidentDocuments.length > 0;
