import { getTranslator } from "@/i18n/translator";
import { API, idProject } from "@/utils/api/api";
import { MessageType } from "@/context/MessageContext";
import { IBotRunNowResult } from "@/types/bots/IBotHealth";
import { GenericResponse } from "@/types/global/IGlobal";

// POST /data/bots/run-now/:scheduleId (cashport-backend, DataController.runBotNow).
// Requiere el header `projectid`, que `API` no inyecta automáticamente (a diferencia
// de `instance`/`fetcher`), por lo que se pasa explícito en cada llamada.
export const executeBotManually = async (
  scheduleId: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
): Promise<boolean> => {
  try {
    const response: GenericResponse<IBotRunNowResult> = await API.post(
      `/data/bots/run-now/${scheduleId}`,
      undefined,
      { headers: { projectid: `${idProject}` } }
    );

    if (response.data.accepted) {
      showMessage("success", getTranslator("shared")("services.botRunRequested"));
      return true;
    }

    showMessage(
      "error",
      response.data.schedulerMessage || getTranslator("shared")("services.botRunFailed")
    );
    return false;
  } catch (error: any) {
    showMessage("error", error?.message || getTranslator("shared")("services.botRunFailed"));
    return false;
  }
};
