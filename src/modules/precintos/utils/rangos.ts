/** Separa un código en prefijo y número final: "TS100" → { prefijo: "TS", numero: "100" }. */
export const partirCodigo = (codigo: string) => {
  const match = /^(.*?)(\d+)$/.exec(codigo.trim());
  return match ? { prefijo: match[1], numero: match[2] } : null;
};

/** Ancho fijo solo si el número trae ceros a la izquierda ("0099" → 4); si no, sin relleno. */
const anchoNumero = (numero: string) => (numero.length > 1 && numero.startsWith('0') ? numero.length : 0);

/** Códigos de un rango con el mismo prefijo: "TS100" – "TS109", "100" – "109" o "0098" – "0102". */
export const armarRango = (desde: string, hasta: string): string[] => {
  const ini = partirCodigo(desde);
  const fin = partirCodigo(hasta);
  if (!ini || !fin) throw new Error('Ingresa un rango válido (ej. 100 – 109 o TS100 – TS109)');
  if (ini.prefijo.toUpperCase() !== fin.prefijo.toUpperCase()) {
    throw new Error('Desde y Hasta deben tener el mismo prefijo');
  }
  const inicio = Number(ini.numero);
  const final = Number(fin.numero);
  if (final < inicio) throw new Error('El número final debe ser mayor o igual al inicial');

  const cantidad = final - inicio + 1;
  if (cantidad > 1000) {
    throw new Error(`El rango supera el máximo permitido de 1.000 precintos (solicitaste ${cantidad}).`);
  }

  const ancho = anchoNumero(ini.numero);
  return Array.from({ length: cantidad }, (_, i) => `${ini.prefijo}${String(inicio + i).padStart(ancho, '0')}`);
};

/** Si los códigos son seguidos con el mismo prefijo (un grupo de la tabla o uno solo), devuelve su rango. */
export const rangoConsecutivo = (codigos: string[]): { desde: string; hasta: string } | null => {
  if (codigos.length === 0) return null;
  const partes = codigos.map(partirCodigo);
  if (partes.some((p) => !p)) return null;

  const ordenados = (partes as { prefijo: string; numero: string }[])
    .map((p, i) => ({ ...p, valor: Number(p.numero), codigo: codigos[i] }))
    .sort((a, b) => a.valor - b.valor);
  const primero = ordenados[0];
  const ultimo = ordenados[ordenados.length - 1];
  const mismoPrefijo = ordenados.every((p) => p.prefijo === primero.prefijo);
  const seguidos = ordenados.every((p, i) => i === 0 || p.valor === ordenados[i - 1].valor + 1);
  if (!mismoPrefijo || !seguidos) return null;

  // Al rearmar el rango deben salir exactamente los mismos códigos (prefijo y ceros incluidos).
  try {
    const rearmado = armarRango(primero.codigo, ultimo.codigo);
    const iguales = rearmado.every((c, i) => c === ordenados[i].codigo);
    return iguales ? { desde: primero.codigo, hasta: ultimo.codigo } : null;
  } catch {
    return null;
  }
};

/** Códigos escritos a mano: separados por coma, espacio o salto de línea, sin repetidos. */
export const partirCodigosEscritos = (texto: string): string[] => [
  ...new Set(texto.split(/[\s,;]+/).map((c) => c.trim()).filter(Boolean)),
];
