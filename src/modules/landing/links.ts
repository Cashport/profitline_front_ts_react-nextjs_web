// Destinos en profitline.co para cada línea de negocio, sector y país.
// Todos llevan UTM para que el equipo comercial vea en la analítica de
// profitline.co que la visita viene de cashport.ai, desde qué idioma y desde
// qué parte de la landing (utm_content).
import type { Lang } from "./content";

export const SITE_URL = "https://cashport.ai";
export const PROFITLINE_URL = "https://profitline.co";
export const PROFITLINE_LINKEDIN = "https://www.linkedin.com/company/profitline-bop/";
export const PROFITLINE_YOUTUBE = "https://www.youtube.com/@profitlinebpo";

const PATHS = {
  home: "/",
  about: "/nosotros/",
  services: "/servicios/",
  platforms: "/plataformas/",
  contact: "/contactanos/",
  mexico: "/mx/",
  orderToCash: "/plataformas/order-to-cash/",
  reverseLogistics: "/servicios/logistica-inversa/",
  logisticsHub: "/plataformas/sistema-de-gestion-de-transporte-tms/",
  sellOut: "/servicios/business-intelligence/",
  salesHub: "/servicios/gestion-comercial/",
  pharma: "/industrias/farmaceutica/",
  consumer: "/industrias/consumo-masivo/",
  oilGas: "/industrias/petroleo-y-gas/",
  financial: "/industrias/seguros-y-asistencias/"
} as const;

export type ProfitlineTarget = keyof typeof PATHS;

export const PRIVACY_POLICY_URL =
  "https://profitline.co/wp-content/uploads/2026/02/PE-DG-020-POLITICA-DE-PRIVACIDAD-PROFITLINE-V1.pdf";
export const DATA_POLICY_URL =
  "https://profitline.co/wp-content/uploads/2026/06/PE_MN_002_Manual_de_politicas_tratamiento_de_datos_personales_V2.pdf";

export const profitlineUrl = (target: ProfitlineTarget, lang: Lang, placement: string) => {
  const url = new URL(PATHS[target], PROFITLINE_URL);
  url.searchParams.set("utm_source", "cashport.ai");
  url.searchParams.set("utm_medium", "landing");
  url.searchParams.set("utm_campaign", `cashport-login-${lang}`);
  url.searchParams.set("utm_content", placement);
  return url.toString();
};
