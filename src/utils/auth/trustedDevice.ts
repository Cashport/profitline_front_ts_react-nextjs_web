const DEVICE_TOKEN_KEY = "deviceToken";

/**
 * Token opaco que identifica a este navegador como un dispositivo que ya
 * superó una validación OTP.
 *
 * Vive en localStorage, no en cookie: el backend está en otro origen, así que
 * una cookie suya sería cross-site. Se envía únicamente en las llamadas
 * /auth/*, nunca en el interceptor global, y en base de datos solo se guarda
 * su SHA-256.
 *
 * A propósito NO se borra en el logout: sobrevivir al cierre de sesión es
 * justamente lo que evita pedir OTP cada vez en un equipo conocido.
 */
export const getDeviceToken = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_TOKEN_KEY);
  } catch {
    // Modo privado o almacenamiento bloqueado: se trata como equipo nuevo.
    return null;
  }
};

export const setDeviceToken = (token: string | null): void => {
  if (!token) return;
  try {
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  } catch {
    // Sin almacenamiento el login sigue funcionando, solo se pedirá OTP la
    // próxima vez.
  }
};

export const clearDeviceToken = (): void => {
  try {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch {
    // no-op
  }
};
