import { mutate } from "swr";

// Backend es la fuente de verdad: tras una carga/procesamiento exitoso, revalida TODA
// la cache SWR de Data Quality (fallas por cliente, resumen por país, alertas, dashboard,
// catálogos, bots) en vez de calcular/restar contadores localmente en cada vista.
export function invalidateDataQualityCache() {
  return mutate((key) => typeof key === "string" && key.startsWith("/data/"));
}
