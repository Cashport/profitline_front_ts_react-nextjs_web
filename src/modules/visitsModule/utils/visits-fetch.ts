import type { SWRConfiguration } from "swr";

/**
 * Política de revalidación de los GET por día: un día que ya se cerró no cambia, así que
 * no se vuelve a pedir —ni al volver a la pestaña, ni al reconectar, ni al regresar a
 * esta vista con la caché ya llena—. Entra por la URL y se pide una vez.
 *
 * Lo único que lo trae de vuelta es que falle: SWR conserva su reintento con backoff
 * exponencial, que es justo la excepción que se quiere. En el día en curso no se toca
 * nada y manda la revalidación por defecto de SWR.
 */
export const dayFetchOptions = (isToday: boolean): SWRConfiguration =>
  isToday
    ? {}
    : {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false
      };
