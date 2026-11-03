import { useMemo } from "react";
import { useTranslations } from "use-intl";

import { IReferenceScopeLevel } from "@/types/dataQuality/IDataQuality";
import {
  REFERENCE_SCOPE_LEVELS,
  ReferenceScopeLabels,
  scopeLabel
} from "../references/references.utils";

/** Etiquetas traducidas de los ambitos de referencia (cliente, pais, region). */
export const useReferenceScopeLabels = () => {
  const t = useTranslations("dataQuality.references.scope");
  return useMemo(() => {
    const labels: ReferenceScopeLabels = {
      client: t("client"),
      country: t("country"),
      region: t("region")
    };
    return {
      labels,
      options: REFERENCE_SCOPE_LEVELS.map((value) => ({ value, label: labels[value] })),
      label: (scope: IReferenceScopeLevel | string) => scopeLabel(scope, labels)
    };
  }, [t]);
};
