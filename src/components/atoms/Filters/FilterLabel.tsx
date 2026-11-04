"use client";
import { useTranslations } from "use-intl";

import type { Messages } from "@/i18n/types";

export type FilterLabelKey = keyof Messages["components"]["filters"]["labels"];

/**
 * Etiqueta traducida para opciones de filtros definidas fuera del componente (constantes de
 * módulo o árboles del Cascader que se mutan en `loadData`): se traduce al renderizar, así que
 * cambia de idioma sin reconstruir las opciones.
 */
export const FilterLabel = ({ k }: { k: FilterLabelKey }) => {
  const t = useTranslations("components.filters.labels");
  return <>{t(k)}</>;
};

export const filterLabel = (k: FilterLabelKey) => <FilterLabel k={k} />;
