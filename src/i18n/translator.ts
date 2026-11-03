// Traducción fuera de React (servicios, utilidades, mensajes de error armados en funciones).
// El I18nProvider registra aquí el idioma y los mensajes activos; dentro de componentes usa
// useTranslations, que además re-renderiza al cambiar de idioma.
import { createTranslator } from "use-intl";

import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Messages } from "./types";

let current: { locale: Locale; messages: Messages | null } = {
  locale: DEFAULT_LOCALE,
  messages: null
};

export const setActiveTranslations = (locale: Locale, messages: Messages) => {
  current = { locale, messages };
};

export const getActiveLocale = (): Locale => current.locale;

type Namespace = keyof Messages;

/**
 * Traductor de un namespace para código no React. Se resuelve en cada llamada para usar
 * siempre el idioma activo:
 *   const t = getTranslator("common"); t("errors.generic")
 */
export const getTranslator = <N extends Namespace>(namespace: N) => {
  if (!current.messages) {
    // Antes de que carguen los mensajes no hay texto que mostrar: se devuelve la clave.
    return ((key: string) => `${namespace}.${key}`) as unknown as ReturnType<
      typeof createTranslator<Messages, N>
    >;
  }
  return createTranslator({
    locale: current.locale,
    messages: current.messages,
    namespace
  });
};
