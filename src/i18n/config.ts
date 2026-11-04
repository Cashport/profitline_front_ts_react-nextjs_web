// Idioma de la plataforma. La preferencia vive en el usuario (backend: user_preference.LANGUAGE)
// y se refleja en la cookie cp_lang, la misma que usa la landing: así el idioma elegido en la
// landing llega a la app y el de la app sobrevive al cierre de sesión en este navegador.
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, languageFromHeader } from "@/modules/landing/language";

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

/**
 * Inglés en revisión: mientras sea true, solo un super admin puede ver la app en inglés y ver el
 * selector de idioma; el resto la ve siempre en español, sin importar navegador ni cookie.
 * Ponerlo en false cuando producto apruebe la traducción.
 */
export const ENGLISH_FOR_SUPER_ADMINS_ONLY = true;

export const isLocale = (value: unknown): value is Locale => value === "es" || value === "en";

/** Nombre de cada idioma en su propio idioma: así lo reconoce quien no entiende el actual. */
export const LOCALE_LABELS: Record<Locale, string> = { es: "Español", en: "English" };

export const readLocaleCookie = (): Locale | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return isLocale(match?.[1]) ? match[1] : null;
};

export const writeLocaleCookie = (locale: Locale) => {
  document.cookie = `${LANG_COOKIE}=${locale}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
};

/** Cookie (preferencia guardada) → idioma del navegador → español. */
export const detectInitialLocale = (): Locale => {
  const saved = readLocaleCookie();
  if (saved) return saved;
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languageFromHeader(languages.filter(Boolean).join(",") || null);
};
