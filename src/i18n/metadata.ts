// Título y descripción de la pestaña del navegador en el idioma del usuario. Los layouts de
// servidor no pueden usar hooks: leen la cookie cp_lang, la misma que usa el I18nProvider.
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { LANG_COOKIE } from "@/modules/landing/language";
import { DEFAULT_LOCALE, ENGLISH_FOR_SUPER_ADMINS_ONLY, isLocale } from "./config";
import esMeta from "./messages/es/meta.json";
import enMeta from "./messages/en/meta.json";

type PageKey = keyof typeof esMeta;
type PageMeta = { title: string; description?: string };

export const pageMetadata = (page: PageKey): Metadata => {
  const saved = cookies().get(LANG_COOKIE)?.value;
  // El servidor no sabe si es super admin: mientras el inglés esté en revisión, títulos en español.
  const locale = !ENGLISH_FOR_SUPER_ADMINS_ONLY && isLocale(saved) ? saved : DEFAULT_LOCALE;
  const entry: PageMeta = (locale === "en" ? enMeta : esMeta)[page];
  return { title: entry.title, description: entry.description ?? entry.title };
};
