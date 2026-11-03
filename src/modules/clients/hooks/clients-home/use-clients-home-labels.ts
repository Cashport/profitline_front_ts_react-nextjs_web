"use client";

import { useMemo } from "react";
import { useTranslations } from "use-intl";

import type {
  ClientsHomeAgingBucket,
  ClientsHomeForecastStatus
} from "@/types/clients/IClientsHome";
import { AGING_BY_KEY, type DuePeriod } from "../../constants/clients-home";

/** Textos traducidos de tramos de edad, estados de forecast y periodos del Home de Clientes. */
export const useClientsHomeLabels = () => {
  const t = useTranslations("clients.home");
  return useMemo(
    () => ({
      /** "Corriente" / "1–30"… */
      aging: (key: ClientsHomeAgingBucket) => AGING_BY_KEY[key].range ?? t("aging.current"),
      /** Rótulo corto de la leyenda del KPI ("Corr."). */
      agingShort: (key: ClientsHomeAgingBucket) =>
        AGING_BY_KEY[key].range ?? t("aging.currentShort"),
      forecast: (status: ClientsHomeForecastStatus) => t(`forecastStatus.${status}`),
      duePeriod: (period: DuePeriod) => t(`duePeriods.${period}`)
    }),
    [t]
  );
};
