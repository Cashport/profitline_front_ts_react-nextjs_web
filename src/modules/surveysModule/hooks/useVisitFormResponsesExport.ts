import { useState } from "react";
import { useTranslations } from "use-intl";

import { useMessageApi } from "@/context/MessageContext";
import { exportVisitFormResponses } from "@/services/surveys/surveys";
import type { IVisitFormResponsesExportParams } from "@/types/surveys/ISurveys";

/** "Descargar respuestas": baja el archivo del periodo y avisa cómo terminó. */
export const useVisitFormResponsesExport = (formId: number) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showMessage } = useMessageApi();
  const t = useTranslations("surveys.download");

  const download = async (params: IVisitFormResponsesExportParams) => {
    setIsDownloading(true);
    try {
      await exportVisitFormResponses(formId, params);
      showMessage("success", t("success"));
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("error"));
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};
