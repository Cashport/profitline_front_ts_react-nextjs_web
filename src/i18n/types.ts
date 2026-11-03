import type esMessages from "./messages/es";
import type { Locale } from "./config";

export type Messages = typeof esMessages;

// Claves tipadas en useTranslations/useFormatter: una clave inexistente es error de TypeScript.
declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
