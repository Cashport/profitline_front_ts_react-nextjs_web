import { useTranslations } from "use-intl";
import { useMessageApi } from "@/context/MessageContext";
import { reprocessExcel, reprocessPDF } from "@/services/paymentApplications/paymentApplications";

import { IHistoryRow } from "@/types/clientHistory/IClientHistory";

interface UseHistoryRowActionsProps {
  /** Abre el modal de detalle de comunicación con el id del log en Mongo. */
  onOpenCommunicationDetail: (mongoId: string) => void;
}

const isPaymentApplicationEvent = (row: IHistoryRow) => {
  const eventNormalized = (row.event || "").toLowerCase();
  return eventNormalized === "aplicación de pago" || eventNormalized === "legalización de saldo";
};

const getApplicationIdFromRow = (row: IHistoryRow) => {
  const directApplicationId = row.id_payment_application;
  if (typeof directApplicationId === "number" && directApplicationId > 0) {
    return directApplicationId;
  }

  return null;
};

/** Acciones por fila del historial del cliente: ver detalle, regenerar plano y PDF. */
export const useHistoryRowActions = ({ onOpenCommunicationDetail }: UseHistoryRowActionsProps) => {
  const { showMessage } = useMessageApi();
  const t = useTranslations("clients.history.rowActions");

  const handleOpenDetail = (row: IHistoryRow) => {
    if (row.url) {
      window.open(row.url, "_blank");
      return;
    }
    if (!row.id_mongo_log) return showMessage("info", t("noDetail"));
    onOpenCommunicationDetail(row.id_mongo_log);
  };

  const handleRegenerateExcel = async (row: IHistoryRow) => {
    if (!isPaymentApplicationEvent(row)) {
      return showMessage("info", t("onlyPaymentEvents"));
    }

    const applicationId = getApplicationIdFromRow(row);

    if (!applicationId) {
      return showMessage("info", t("applicationIdNotFound"));
    }

    try {
      const data = await reprocessExcel(applicationId);
      window.open(data.excel_url, "_blank");
    } catch (error) {
      if (row.payment_identification_excel_url) {
        window.open(row.payment_identification_excel_url, "_blank");
        return;
      }

      const message = error instanceof Error ? error.message : t("flatFileError");
      showMessage("error", message);
    }
  };

  const handleRegeneratePDF = async (row: IHistoryRow) => {
    if (!isPaymentApplicationEvent(row)) {
      return showMessage("info", t("onlyPaymentEvents"));
    }

    const applicationId = getApplicationIdFromRow(row);

    if (!applicationId) {
      return showMessage("info", t("applicationIdNotFound"));
    }

    try {
      const data = await reprocessPDF(applicationId);
      window.open(data.pdf_url, "_blank");
    } catch (error) {
      if (row.payment_identification_url) {
        window.open(row.payment_identification_url, "_blank");
        return;
      }

      const message = error instanceof Error ? error.message : t("pdfError");
      showMessage("error", message);
    }
  };

  return { handleOpenDetail, handleRegenerateExcel, handleRegeneratePDF };
};
