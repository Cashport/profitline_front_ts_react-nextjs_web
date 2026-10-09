/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Las novedades abiertas se reparten el bucket "novedad" de cada
   cliente del portafolio, así que suman exactamente ese saldo: la
   tarjeta, el panel por tipo y el segmento naranja de todas las
   barras de la página hablan del mismo dinero.
   ============================================================ */
import { NOVELTY_TIPOS } from "@/modules/noveltiesModule/constants";
import { WALLET_PORTFOLIO, EJECUTIVO_POR_CLIENTE } from "@/modules/walletModule/mocked-data";
import { HOY, dias } from "@/modules/walletModule/utils/format";
import type { IWalletClientRow, TramoIndex } from "@/modules/walletModule/types";
import type { ITorreNovedad } from "./types";

const M = 1e6;

/** Cuántas novedades abre un cliente, según lo que tenga en gestión. */
const cuantas = (monto: number): number => (monto >= 400 * M ? 3 : monto >= 150 * M ? 2 : 1);

/**
 * Desfase del compromiso sobre el SLA del tipo. Los negativos son días ya
 * cumplidos: por debajo de −10 ganan a cualquier SLA del catálogo, así que la
 * novedad sale vencida sin depender del tipo que le toque.
 */
const DESFASE = [6, -16, 12, 3, -13, 18, 1, -19, 9, 4, 21, -11];

/** Días sin gestión. El null es el caso de "nunca se tocó". */
const SIN_GESTION: (number | null)[] = [9, 2, 15, 4, 22, 7, 11, 1, 18, 6, 30, null, 13, 3];

/**
 * Novedades de un cliente. Cada una se queda con un puñado de tramos suyos, sin
 * repetir ninguno: por eso las partes vuelven a sumar el bucket, y por eso el
 * filtro de tramo puede descartar unas y dejar otras —que es justo lo que hace
 * la referencia, donde la novedad cuelga de facturas con su propia antigüedad.
 */
function derivarNovedades(cliente: IWalletClientRow, i: number): ITorreNovedad[] {
  const conGestion = cliente.tramos
    .map((celda, t) => ({ tramo: t as TramoIndex, monto: celda.novedad }))
    .filter((x) => x.monto > 0);
  if (conGestion.length === 0) return [];

  const total = conGestion.reduce((a, x) => a + x.monto, 0);
  const n = Math.min(cuantas(total), conGestion.length);

  const cubos: TramoIndex[][] = Array.from({ length: n }, () => []);
  const montos = new Array<number>(n).fill(0);
  conGestion.forEach((x, k) => {
    const c = (k + i) % n;
    cubos[c].push(x.tramo);
    montos[c] += x.monto;
  });

  return cubos.map((tramos, k) => {
    const tipo = NOVELTY_TIPOS[(i * 3 + k) % NOVELTY_TIPOS.length];
    const desfase = DESFASE[(i * 2 + k) % DESFASE.length];

    return {
      id: `NOV-${1100 + i * 5 + k}`,
      tipo: tipo.id,
      clienteId: cliente.id,
      tramos,
      ejecutivo: EJECUTIVO_POR_CLIENTE[cliente.id],
      monto: montos[k],
      // El compromiso nace del SLA del tipo y se corre con el desfase.
      compromiso: dias(HOY, tipo.sla + desfase),
      diasSinGestion: SIN_GESTION[(i * 3 + k) % SIN_GESTION.length]
    };
  });
}

export const TORRE_NOVEDADES: ITorreNovedad[] = WALLET_PORTFOLIO.flatMap(derivarNovedades);
