import { useCallback, useEffect, useState } from "react";

import { DAY_START_MIN, PLAYBACK_SPEEDS, PLAYBACK_TICK_MS } from "../constants";

/**
 * Cabezal de la línea de tiempo: el minuto `t` que se mira, entre el inicio de la
 * jornada y `now`. Al cambiar de día (`resetKey`) vuelve a `now` y se detiene.
 */
export function useVisitsPlayback(now: number, resetKey: string) {
  const [t, setT] = useState(now);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(PLAYBACK_SPEEDS[0]);

  // Se ajusta durante el render (no en un efecto) para no pintar un cuadro del día
  // nuevo con el minuto del anterior.
  const key = `${resetKey}|${now}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setT(now);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setT((prev) => Math.min(now, prev + speed)),
      PLAYBACK_TICK_MS
    );
    return () => window.clearInterval(id);
  }, [playing, speed, now]);

  useEffect(() => {
    if (playing && t >= now) setPlaying(false);
  }, [playing, t, now]);

  const seek = useCallback(
    (minute: number) => {
      setPlaying(false);
      setT(Math.max(DAY_START_MIN, Math.min(now, Math.round(minute))));
    },
    [now]
  );

  /** En vivo, reproducir rebobina primero a `rewindTo` (el inicio de la jornada por defecto). */
  const togglePlay = useCallback(
    (rewindTo: number = DAY_START_MIN) => {
      if (playing) {
        setPlaying(false);
        return;
      }
      if (t >= now) setT(Math.max(DAY_START_MIN, Math.min(now, rewindTo)));
      setPlaying(true);
    },
    [playing, t, now]
  );

  const toggleSpeed = useCallback(
    () => setSpeed((s) => (s === PLAYBACK_SPEEDS[0] ? PLAYBACK_SPEEDS[1] : PLAYBACK_SPEEDS[0])),
    []
  );

  const goLive = useCallback(() => {
    setPlaying(false);
    setT(now);
  }, [now]);

  const pause = useCallback(() => setPlaying(false), []);

  return { t, playing, speed, seek, togglePlay, toggleSpeed, goLive, pause };
}
