import { useMemo } from "react";
import { useTranslations } from "use-intl";

import { BOT_FREQUENCY_KEYS } from "../constants";
import { BotStatus } from "../types/automations";

/** Etiquetas traducidas de estado y periodicidad de un bot. */
export const useBotLabels = () => {
  const t = useTranslations("dataQuality.bots");
  return useMemo(
    () => ({
      status: (status: BotStatus) => t(`status.${status}`),
      frequency: (frequency: string) => {
        const key = BOT_FREQUENCY_KEYS[frequency];
        return key ? t(`frequency.${key}`) : frequency;
      }
    }),
    [t]
  );
};
