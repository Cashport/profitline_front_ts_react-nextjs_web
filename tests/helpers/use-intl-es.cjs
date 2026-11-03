// `use-intl` para pruebas que cargan componentes sin el I18nProvider: traduce con el
// catálogo en español, así las aserciones siguen comparando el texto que ve el usuario.
const { readdirSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { createTranslator, createFormatter } = require("use-intl");

const dir = path.resolve(__dirname, "../../src/i18n/messages/es");
const messages = Object.fromEntries(
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => [file.replace(/\.json$/, ""), JSON.parse(readFileSync(path.join(dir, file), "utf8"))])
);

const locale = "es";
const timeZone = "America/Bogota";

// Doble de "@/i18n/translator" con el mismo catálogo.
const translatorEs = {
  getTranslator: (namespace) => createTranslator({ locale, messages, namespace, timeZone }),
  getActiveLocale: () => locale,
  setActiveTranslations: () => {}
};

module.exports = {
  ...require("use-intl"),
  translatorEs,
  useTranslations: (namespace) => createTranslator({ locale, messages, namespace, timeZone }),
  useFormatter: () => createFormatter({ locale, timeZone }),
  useLocale: () => locale,
  useMessages: () => messages
};
