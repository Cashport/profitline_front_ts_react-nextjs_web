// Idioma de la landing según el navegador. Lo usa el middleware para mandar a
// /en a quien tiene el navegador en inglés la primera vez que entra a /.
// La elección manual (ES | EN) queda en una cookie y siempre gana.
import type { Lang } from "./content";

export const LANG_COOKIE = "cp_lang";
// Los botones ES | EN enlazan con ?lang=: el middleware guarda la cookie y
// redirige a la URL limpia, sin necesitar JavaScript.
export const LANG_PARAM = "lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Rastreadores de buscadores, IA y vistas previas de redes: nunca se
// redirigen, para que indexen / en español y /en en inglés (hreflang).
const BOT_UA =
  /bot|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|lighthouse|headless|chatgpt|gptbot|claude|perplexity|google-extended|applebot|bingpreview|whatsapp|telegram|slack/i;

export const isBot = (userAgent: string | null) => !userAgent || BOT_UA.test(userAgent);

export const isLang = (value: string | null | undefined): value is Lang =>
  value === "es" || value === "en";

// Recorre Accept-Language por preferencia (q). Español y portugués → es,
// inglés → en. Si el navegador solo pide otros idiomas (francés, alemán…), se
// muestra en inglés; sin encabezado, en español (idioma principal).
export const languageFromHeader = (acceptLanguage: string | null): Lang => {
  if (!acceptLanguage) return "es";
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { primary: tag.split("-")[0], q: q ? Number(q.split("=")[1]) || 0 : 1, index };
    })
    .filter((entry) => entry.primary && entry.primary !== "*" && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { primary } of ranked) {
    if (primary === "es" || primary === "pt") return "es";
    if (primary === "en") return "en";
  }
  return ranked.length ? "en" : "es";
};
