/** Convierte una URL pegada o una ruta en `{ route, path }`, como los guarda la tabla `endpoint`. */
export const parseEndpointInput = (raw: string): { route: string; path: string } | null => {
  let value = raw.trim();
  if (!value) return null;
  value = value.replace(/^[a-z]+:\/\/[^/]+/i, "");
  value = value.split(/[?#]/)[0];
  value = value.replace(/^\/?api\//i, "/");
  const segments = value.split("/").filter(Boolean);
  if (!segments.length) return null;
  const [route, ...rest] = segments;
  return { route, path: rest.length ? `/${rest.join("/")}` : "" };
};

/** Un segmento ":nombre" de la ruta del código acepta cualquier valor (ids, UUID). */
export const matchesRoutePattern = (pattern: string, path: string) => {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  return (
    a.length === b.length &&
    a.every((segment, i) => segment.startsWith(":") || segment.toLowerCase() === b[i].toLowerCase())
  );
};
