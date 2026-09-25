export const PRODUCT_IMAGE_FALLBACK = "/images/watermark.svg";

/**
 * El backend puede devolver valores que no son URLs válidas (".", "", "  ", rutas relativas).
 * next/image los rechaza con "Failed to parse src", pero solo en desarrollo: la validación del
 * loader vive dentro de un `if (process.env.NODE_ENV !== "production")`. En producción el error
 * se traga y la imagen queda rota, así que hay que normalizar el src antes de pasarlo.
 */
export const getProductImageSrc = (image?: string | null): string => {
  const src = image?.trim();
  if (!src) return PRODUCT_IMAGE_FALLBACK;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  return /^https?:\/\//i.test(src) ? src : PRODUCT_IMAGE_FALLBACK;
};
