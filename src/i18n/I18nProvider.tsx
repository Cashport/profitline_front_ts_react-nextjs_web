"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IntlProvider, type IntlError, IntlErrorCode } from "use-intl";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import enUS from "antd/locale/en_US";
import dayjs from "dayjs";
import "dayjs/locale/es";

import theme from "@/theme/themeConfig";
import { useAppStore } from "@/lib/store/store";
import {
  DEFAULT_LOCALE,
  ENGLISH_FOR_SUPER_ADMINS_ONLY,
  detectInitialLocale,
  writeLocaleCookie,
  type Locale
} from "./config";
import { setActiveTranslations } from "./translator";
import type { Messages } from "./types";

type Tree = { [key: string]: string | Tree };

// El inglés se monta sobre el español: si faltara una clave, se ve en español y no la clave cruda.
// `yarn i18n:check` evita que eso llegue a producción.
const overlay = (base: Tree, over: Tree): Tree => {
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const prev = base[key];
    if (typeof value === "string") {
      if (value) out[key] = value;
    } else if (prev && typeof prev === "object") out[key] = overlay(prev, value);
    else out[key] = value;
  }
  return out;
};

const loadMessages = async (locale: Locale): Promise<Messages> => {
  const es = (await import("./messages/es")).default;
  if (locale === "es") return es;
  const en = (await import("./messages/en")).default;
  return overlay(es as unknown as Tree, en as unknown as Tree) as unknown as Messages;
};

const ANTD_LOCALES = { es: esES, en: enUS };
const TIME_ZONE =
  typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Bogota";

const onError = (error: IntlError) => {
  if (process.env.NODE_ENV !== "production" || error.code !== IntlErrorCode.MISSING_MESSAGE)
    console.warn(error.message);
};

interface LocaleContextValue {
  locale: Locale;
  /** Si este usuario puede cambiar de idioma (ver ENGLISH_FOR_SUPER_ADMINS_ONLY). */
  canChooseLanguage: boolean;
  /** Cambia el idioma de inmediato y lo recuerda en este navegador (cookie cp_lang). */
  setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const useAppLocale = () => {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useAppLocale must be used inside <I18nProvider>");
  return value;
};

interface Props {
  children: React.ReactNode;
  /** Lo que se muestra mientras llegan los textos del idioma (la primera vez). */
  fallback: React.ReactNode;
}

export function I18nProvider({ children, fallback }: Props) {
  const [state, setState] = useState<{ locale: Locale; messages: Messages } | null>(null);
  const isSuperAdmin = useAppStore((s) =>
    Boolean(s.selectedProject?.isSuperAdmin || s.projectsBasicInfo?.some((p) => p.isSuperAdmin))
  );
  const canChooseLanguage = !ENGLISH_FOR_SUPER_ADMINS_ONLY || isSuperAdmin;

  const apply = useCallback(async (locale: Locale) => {
    const messages = await loadMessages(locale);
    setActiveTranslations(locale, messages);
    dayjs.locale(locale);
    document.documentElement.lang = locale;
    setState({ locale, messages });
  }, []);

  // Quien no puede elegir idioma ve siempre español; al confirmarse que es super admin (el store
  // se hidrata después del primer render) se aplica su idioma guardado.
  useEffect(() => {
    apply(canChooseLanguage ? detectInitialLocale() : DEFAULT_LOCALE);
  }, [apply, canChooseLanguage]);

  const setLocale = useCallback(
    async (locale: Locale) => {
      if (!canChooseLanguage) return;
      writeLocaleCookie(locale);
      if (locale !== state?.locale) await apply(locale);
    },
    [apply, canChooseLanguage, state?.locale]
  );

  const contextValue = useMemo(
    () => (state ? { locale: state.locale, canChooseLanguage, setLocale } : null),
    [state, canChooseLanguage, setLocale]
  );

  if (!state || !contextValue) return <>{fallback}</>;

  return (
    <LocaleContext.Provider value={contextValue}>
      <IntlProvider
        locale={state.locale}
        messages={state.messages}
        timeZone={TIME_ZONE}
        onError={onError}
      >
        <ConfigProvider theme={theme} locale={ANTD_LOCALES[state.locale]}>
          {children}
        </ConfigProvider>
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
