/**
 * Fechas de precintos. SQL Server está en UTC y llegan dos tipos:
 * - Solo día (scripts: "2026-11-05" → 00:00:00Z): es una fecha de calendario, se muestra tal cual.
 * - Con hora (GETDATE() del sistema): es un instante en UTC, se muestra en hora de Colombia.
 * Sin esto, "2026-11-05" se veía como 4/11 porque Colombia es UTC-5.
 */
export const formatFechaPrecinto = (value?: string | Date | null, fallback = '-'): string => {
  if (!value) return fallback;
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return fallback;
  const soloDia =
    fecha.getUTCHours() === 0 && fecha.getUTCMinutes() === 0 &&
    fecha.getUTCSeconds() === 0 && fecha.getUTCMilliseconds() === 0;
  return fecha.toLocaleDateString('es-CO', {
    timeZone: soloDia ? 'UTC' : 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/** Hoy en la hora del navegador como "AAAA-MM-DD" (toISOString daría mañana después de las 7 p. m.). */
export const hoyLocal = (): string => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
};
