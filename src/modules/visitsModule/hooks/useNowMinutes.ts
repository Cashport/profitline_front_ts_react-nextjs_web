import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { minutesOfDay } from "../utils/visits-format";

/**
 * Minuto real del día (desde medianoche, entero): el "ahora" de hoy. Es null hasta
 * montar, porque el servidor no conoce la hora del navegador y el primer render debe
 * coincidir al hidratar. Se revisa cada `intervalMs`, pero sólo cambia una vez por minuto.
 */
export function useNowMinutes(intervalMs = 15_000) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Math.floor(minutesOfDay(dayjs())));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
