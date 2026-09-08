/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Mantienen la forma que debe devolver el backend: al conectar el
   servicio sólo cambia el origen, no los componentes.

   Los grupos y sus detalles se derivan de la matriz, igual que en
   el backend saldrían de agrupar las mismas facturas: así el
   drilldown cuadra: los grupos de un cliente suman su fila, y los
   de un tramo suman esa celda.
   ============================================================ */
import { EST_META, ORDEN_EST, TRAMO_DIAS } from "./constants";
import { HOY, dias, fmtDc } from "./utils/format";
import {
  EstadoKey,
  IWalletClientRow,
  IWalletGroupDetail,
  IWalletGroupRow,
  IWalletInvoice,
  IWalletMatrixCell,
  IWalletPerson,
  IWalletSummary,
  IWalletTicket,
  Sev,
  TramoIndex
} from "./types";

const M = 1e6;
const MM = 1e9;

/** Reparto por estado de cada tramo: entre más viejo, más novedad y sin conciliar. */
const PERFIL_TRAMO: Record<string, number>[] = [
  { compensada: 0.03, pagada: 0.04, conciliado: 0.82, novedad: 0.03, sin_conciliar: 0.08 },
  { compensada: 0.06, pagada: 0.1, conciliado: 0.45, novedad: 0.22, sin_conciliar: 0.17 },
  { compensada: 0.08, pagada: 0.09, conciliado: 0.32, novedad: 0.3, sin_conciliar: 0.21 },
  { compensada: 0.09, pagada: 0.08, conciliado: 0.28, novedad: 0.32, sin_conciliar: 0.23 },
  { compensada: 0.1, pagada: 0.07, conciliado: 0.22, novedad: 0.36, sin_conciliar: 0.25 },
  { compensada: 0.12, pagada: 0.06, conciliado: 0.16, novedad: 0.38, sin_conciliar: 0.28 }
];

/** Convierte un total de tramo en su desglose por estado, cuadrando el redondeo. */
function cell(total: number, ti: number): IWalletMatrixCell {
  const perfil = PERFIL_TRAMO[ti];
  const parts = ORDEN_EST.map((e) => Math.round(total * perfil[e]));
  const diff = total - parts.reduce((a, b) => a + b, 0);
  parts[2] += diff; // el sobrante cae en conciliado, el segmento más grande
  return {
    compensada: parts[0],
    pagada: parts[1],
    conciliado: parts[2],
    novedad: parts[3],
    sin_conciliar: parts[4],
    total
  };
}

const row = (
  id: string,
  nombre: string,
  nit: string,
  ejecutivo: string,
  totales: number[]
): IWalletClientRow => ({
  id,
  nombre,
  nit,
  ejecutivo,
  tramos: totales.map((t, i) => cell(t, i))
});

export const WALLET_CLIENT_ROWS: IWalletClientRow[] = [
  row("C001", "OXXO COLOMBIA S.A.S.", "843326788", "Cristina Osorio", [
    7.92 * MM,
    1.32 * MM,
    377 * M,
    49 * M,
    150 * M,
    25 * M
  ]),
  row("C002", "KOBA COLOMBIA S.A.S. (D1)", "894204193", "Cristina Osorio", [
    5.61 * MM,
    1.16 * MM,
    336 * M,
    74 * M,
    135 * M,
    103 * M
  ]),
  row("C003", "ALMACENES ÉXITO S.A.", "846874074", "Mónica Bermúdez", [
    5.33 * MM,
    856 * M,
    371 * M,
    86 * M,
    109 * M,
    135 * M
  ]),
  row("C004", "ARCOS DORADOS COLOMBIA S.A.S.", "810162228", "Germán Torres", [
    3.54 * MM,
    479 * M,
    91 * M,
    0,
    136 * M,
    65 * M
  ])
];

/** Totales de la vista completa (16 clientes), no sólo de las filas mostradas. */
export const WALLET_SUMMARY: IWalletSummary = {
  clientes: 16,
  segments: {
    compensada: 2.12 * MM,
    pagada: 3.04 * MM,
    conciliado: 34.88 * MM,
    novedad: 4.37 * MM,
    sin_conciliar: 6.85 * MM,
    total: 51.26 * MM,
    vencido: 11.4 * MM,
    n: 835
  }
};

/* ---------- Personas ---------- */

export const WALLET_PEOPLE: Record<string, IWalletPerson> = {
  cosorio: { id: "cosorio", nombre: "Cristina Osorio", iniciales: "CO" },
  gtorres: { id: "gtorres", nombre: "Germán Torres", iniciales: "GT" },
  mbermudez: { id: "mbermudez", nombre: "Mónica Bermúdez", iniciales: "MB" },
  backoffice: { id: "backoffice", nombre: "Back Office", iniciales: "BO" },
  comercial: { id: "comercial", nombre: "Comercial", iniciales: "CM" }
};

/** Áreas, no personas: su nombre no se acorta a "Nombre A.". */
const AREAS = new Set(["backoffice", "comercial"]);

/** "Cristina Osorio" → "Cristina O.", igual que PersonBadge en modo mini. */
const mini = (p: IWalletPerson): string => {
  if (AREAS.has(p.id)) return p.nombre;
  const [nombre, apellido] = p.nombre.split(" ");
  return apellido ? `${nombre} ${apellido[0]}.` : nombre;
};

const EJECUTIVO_POR_CLIENTE: Record<string, IWalletPerson> = {
  C001: WALLET_PEOPLE.cosorio,
  C002: WALLET_PEOPLE.cosorio,
  C003: WALLET_PEOPLE.mbermudez,
  C004: WALLET_PEOPLE.gtorres
};

/* ---------- Semillas de los grupos ---------- */

/** Una novedad abierta. `peso` es su parte del bucket "novedad" del cliente. */
interface NovedadSeed {
  id: string;
  peso: number;
  detalle: string;
  responsable: IWalletPerson;
  diasSinGestion: number;
  compromiso: Date;
  limite: Date;
  estado: { nom: string; sev: Sev };
}

/** Novedades por cliente. Los pesos de cada cliente deben sumar 1. */
const NOVEDADES: Record<string, NovedadSeed[]> = {
  C001: [
    {
      id: "NOV-1041",
      peso: 0.6,
      detalle: "Nota crédito comercial",
      responsable: WALLET_PEOPLE.cosorio,
      diasSinGestion: 2,
      compromiso: new Date(2026, 8, 12),
      limite: new Date(2026, 8, 26),
      estado: { nom: "En gestión", sev: "idle" }
    },
    {
      id: "NOV-1043",
      peso: 0.4,
      detalle: "Descuento no aplicado",
      responsable: WALLET_PEOPLE.backoffice,
      diasSinGestion: 7,
      compromiso: new Date(2026, 8, 5),
      limite: new Date(2026, 8, 19),
      estado: { nom: "Esperando aprobación", sev: "warn" }
    }
  ],
  C002: [
    {
      id: "NOV-1042",
      peso: 0.55,
      detalle: "Factura rechazada / sin radicar",
      responsable: WALLET_PEOPLE.backoffice,
      diasSinGestion: 9,
      compromiso: new Date(2026, 7, 28),
      limite: new Date(2026, 8, 5),
      estado: { nom: "Esperando aprobación", sev: "warn" }
    },
    {
      id: "NOV-1044",
      peso: 0.45,
      detalle: "Diferencia en precio",
      responsable: WALLET_PEOPLE.cosorio,
      diasSinGestion: 3,
      compromiso: new Date(2026, 8, 18),
      limite: new Date(2026, 9, 2),
      estado: { nom: "En gestión", sev: "idle" }
    }
  ],
  C003: [
    {
      id: "NOV-1045",
      peso: 0.62,
      detalle: "Faltante en la entrega",
      responsable: WALLET_PEOPLE.mbermudez,
      diasSinGestion: 1,
      compromiso: new Date(2026, 8, 10),
      limite: new Date(2026, 8, 24),
      estado: { nom: "En gestión", sev: "idle" }
    },
    {
      id: "NOV-1046",
      peso: 0.38,
      detalle: "Pago no identificado",
      responsable: WALLET_PEOPLE.mbermudez,
      diasSinGestion: 12,
      compromiso: new Date(2026, 7, 22),
      limite: new Date(2026, 8, 5),
      estado: { nom: "Aprobada", sev: "ok" }
    }
  ],
  C004: [
    {
      id: "NOV-1047",
      peso: 1,
      detalle: "Devolución pendiente de NC",
      responsable: WALLET_PEOPLE.gtorres,
      diasSinGestion: 5,
      compromiso: new Date(2026, 8, 15),
      limite: new Date(2026, 8, 29),
      estado: { nom: "En gestión", sev: "idle" }
    }
  ]
};

const NOVEDAD_POR_ID: Record<string, NovedadSeed> = Object.fromEntries(
  Object.values(NOVEDADES).flatMap((ns) => ns.map((n) => [n.id, n]))
);

/** Valor promedio de factura por estado, para derivar un conteo verosímil. */
const FACTURA_PROM: Record<EstadoKey, number> = {
  compensada: 38 * M,
  pagada: 52 * M,
  conciliado: 96 * M,
  novedad: 44 * M,
  sin_conciliar: 28 * M
};

/** Días sin gestión base de cada estado. null = nunca se ha gestionado. */
const GESTION_EST: Record<EstadoKey, number | null> = {
  compensada: 5,
  pagada: 6,
  conciliado: 4,
  novedad: 0, // lo define cada novedad
  sin_conciliar: null
};

/** Tope de facturas por grupo: la tabla del modal se vuelve inmanejable. */
const MAX_FACTURAS = 60;

/**
 * Reparte un vector de tramos entre varias novedades según sus pesos. La última
 * se lleva el sobrante, así las partes vuelven a sumar el original sin arrastrar
 * el error de redondeo.
 */
function repartir(tramos: number[], pesos: number[]): number[][] {
  const partes = pesos.map(() => tramos.map(() => 0));

  tramos.forEach((monto, t) => {
    let restante = monto;
    pesos.forEach((peso, i) => {
      const parte = i === pesos.length - 1 ? restante : Math.round(monto * peso);
      partes[i][t] = parte;
      restante -= parte;
    });
  });

  return partes;
}

/**
 * Conteo de facturas verosímil para un grupo. Nunca por debajo del número de
 * tramos con saldo: buildInvoices necesita al menos un cupo por tramo.
 */
const contarFacturas = (tramos: number[], monto: number, estado: EstadoKey): number => {
  const conSaldo = tramos.filter((t) => t > 0).length;
  return Math.max(conSaldo, Math.min(MAX_FACTURAS, Math.round(monto / FACTURA_PROM[estado])));
};

/** Un grupo por cliente × estado; el bucket de novedad se abre en sus novedades. */
function derivarGrupos(rows: IWalletClientRow[]): IWalletGroupRow[] {
  const grupos: IWalletGroupRow[] = [];

  rows.forEach((cliente, iCliente) => {
    const ejecutivo = EJECUTIVO_POR_CLIENTE[cliente.id];

    ORDEN_EST.forEach((estado) => {
      const tramos = cliente.tramos.map((c) => c[estado]);
      const monto = tramos.reduce((a, b) => a + b, 0);
      if (monto === 0) return;

      if (estado === "novedad") {
        const seeds = NOVEDADES[cliente.id] ?? [];
        const partes = repartir(
          tramos,
          seeds.map((n) => n.peso)
        );

        seeds.forEach((nov, i) => {
          const suyos = partes[i];
          const suMonto = suyos.reduce((a, b) => a + b, 0);
          if (suMonto === 0) return;

          grupos.push({
            clave: nov.id,
            clienteId: cliente.id,
            tipo: "novedad",
            novedadId: nov.id,
            detalle: nov.detalle,
            cliente: cliente.nombre,
            facturas: contarFacturas(suyos, suMonto, "novedad"),
            monto: suMonto,
            tramos: suyos,
            responsable: mini(nov.responsable),
            diasSinGestion: nov.diasSinGestion,
            compromiso: fmtDc(nov.compromiso),
            limite: fmtDc(nov.limite),
            estado: nov.estado
          });
        });
        return;
      }

      const base = GESTION_EST[estado];

      grupos.push({
        clave: `${cliente.id}|${estado}`,
        clienteId: cliente.id,
        tipo: estado,
        detalle: EST_META[estado].corta,
        cliente: cliente.nombre,
        facturas: contarFacturas(tramos, monto, estado),
        monto,
        tramos,
        // Sin conciliar es justamente lo que nadie ha tomado.
        responsable: estado === "sin_conciliar" ? null : mini(ejecutivo),
        diasSinGestion: base === null ? null : base + (iCliente % 3),
        compromiso: null,
        limite: null,
        estado: { nom: EST_META[estado].chipTxt, sev: EST_META[estado].chip }
      });
    });
  });

  return grupos;
}

export const WALLET_GROUP_ROWS: IWalletGroupRow[] = derivarGrupos(WALLET_CLIENT_ROWS);

/* ---------- Detalle de cada grupo (modal de gestión) ---------- */

/**
 * Deriva las facturas de un grupo a partir de su reparto por tramo, para que
 * el conteo, el saldo y la barra del modal cuadren por construcción con la
 * fila de la tabla. Sin aleatoriedad: el resultado es siempre el mismo.
 */
function buildInvoices(
  clave: string,
  tramos: number[],
  nFacturas: number,
  docBase: number
): IWalletInvoice[] {
  const activos = tramos
    .map((monto, tramo) => ({ monto, tramo: tramo as TramoIndex }))
    .filter((t) => t.monto > 0);
  const total = activos.reduce((a, t) => a + t.monto, 0);

  // Un cupo por tramo con saldo; el resto se reparte por mayor resto proporcional.
  const cupos = activos.map(() => 1);
  const sobrantes = Math.max(0, nFacturas - activos.length);
  const cuota = activos.map((t) => (sobrantes * t.monto) / total);
  cuota.forEach((c, i) => (cupos[i] += Math.floor(c)));

  let falta = nFacturas - cupos.reduce((a, b) => a + b, 0);
  const porResto = cuota
    .map((c, i) => ({ i, resto: c - Math.floor(c) }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (let k = 0; falta > 0; k++, falta--) cupos[porResto[k % porResto.length].i]++;

  const facturas: IWalletInvoice[] = [];
  let n = docBase;

  activos.forEach(({ monto, tramo }, i) => {
    const partes = Array.from({ length: cupos[i] }, () => Math.round(monto / cupos[i]));
    partes[0] += monto - partes.reduce((a, b) => a + b, 0); // el redondeo cae en la primera

    const mora = TRAMO_DIAS[tramo];
    partes.forEach((saldo) => {
      n += 1;
      facturas.push({
        id: `${clave}-${n}`,
        doc: `FV-2026-${String(n).padStart(5, "0")}`,
        vence: dias(HOY, -mora),
        dias: mora,
        tramo,
        saldo
      });
    });
  });

  return facturas;
}

/**
 * Bitácora y tickets escritos a mano. Lo demás del detalle se deriva del grupo,
 * así que un grupo sin narrativa igual abre el modal, sólo que sin historia.
 */
const NARRATIVA: Record<string, Pick<IWalletGroupDetail, "bitacora" | "tickets">> = {
  "NOV-1041": {
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 18),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "comentario",
        texto: "Se solicita nota crédito comercial por diferencia en el descuento pactado."
      },
      {
        id: "b2",
        fecha: new Date(2026, 7, 24),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "adjunto",
        texto: "Se adjunta el acuerdo comercial firmado.",
        adjuntos: [{ nombre: "acuerdo-comercial-oxxo.pdf", peso: "318 KB" }]
      },
      {
        id: "b3",
        fecha: dias(HOY, -2),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "ticket",
        texto: "Solicitó la aprobación de la nota crédito a Comercial.",
        ticketId: "TK-4410"
      }
    ],
    tickets: [
      {
        id: "TK-4410",
        titulo: "Aprobación de la NC por Comercial",
        comentario: "El descuento pactado está en la cláusula 4 del acuerdo.",
        categoria: "Aprobación comercial o RGM",
        responsable: WALLET_PEOPLE.comercial,
        deadline: dias(HOY, 3),
        estado: "abierto"
      },
      {
        id: "TK-4402",
        titulo: "Confirmar el valor de la NC con el KAM",
        categoria: "Llamada al cliente",
        responsable: WALLET_PEOPLE.cosorio,
        deadline: dias(HOY, -11),
        estado: "resuelto",
        resueltoEl: dias(HOY, -12)
      }
    ]
  },

  "NOV-1042": {
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 12),
        autor: WALLET_PEOPLE.backoffice,
        tipo: "comentario",
        texto: "El cliente rechaza la radicación: faltan los soportes de entrega."
      },
      {
        id: "b2",
        fecha: dias(HOY, -9),
        autor: WALLET_PEOPLE.backoffice,
        tipo: "ticket",
        texto: "Abrió el ticket de reradicación.",
        ticketId: "TK-4381"
      }
    ],
    tickets: [
      {
        id: "TK-4381",
        titulo: "Reradicar las facturas en el portal del cliente",
        comentario: "Adjuntar las remisiones firmadas junto con cada factura.",
        categoria: "Radicación o reradicación",
        responsable: WALLET_PEOPLE.backoffice,
        deadline: dias(HOY, -3),
        estado: "abierto",
        adjuntos: [{ nombre: "remisiones-koba.zip", peso: "1,2 MB" }]
      }
    ]
  },

  "NOV-1046": {
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 6),
        autor: WALLET_PEOPLE.mbermudez,
        tipo: "comentario",
        texto: "Entra un pago sin referencia de factura; se pide el soporte a tesorería."
      },
      {
        id: "b2",
        fecha: dias(HOY, -12),
        autor: null,
        tipo: "evento",
        texto: "La novedad quedó aprobada, pendiente de aplicar el cruce en SAP."
      }
    ],
    tickets: []
  },

  "C004|conciliado": {
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 8),
        autor: WALLET_PEOPLE.gtorres,
        tipo: "comentario",
        texto: "Tesorería confirma que entra en el ciclo de pago del 15."
      },
      {
        id: "b2",
        fecha: dias(HOY, -4),
        autor: WALLET_PEOPLE.gtorres,
        tipo: "comentario",
        texto: "Se envía estado de cuenta al área de pagos del cliente."
      }
    ],
    tickets: []
  }
};

const SIN_NARRATIVA: Pick<IWalletGroupDetail, "bitacora" | "tickets"> = {
  bitacora: [],
  tickets: []
};

/* ---------- Tickets derivados ----------
   La bandeja de /tickets lista los tickets de todos los grupos, así que se
   siembran aquí y no allá: el detalle del grupo es su único dueño y las dos
   vistas no se pueden contradecir. Los escritos a mano en NARRATIVA se
   conservan; estos se numeran TK-24xx para no chocar con ellos. */

/** Acción y categoría de cada ticket derivado. */
const ACCIONES: { titulo: string; categoria: string }[] = [
  { titulo: "Enviar soporte a aprobación comercial", categoria: "Aprobación comercial o RGM" },
  { titulo: "Confirmar la aprobación por correo", categoria: "Correo o seguimiento escrito" },
  { titulo: "Radicar la novedad en el formulario de Back Office", categoria: "Solicitud a Back Office" },
  { titulo: "Solicitar la anulación de la factura", categoria: "Radicación o reradicación" },
  { titulo: "Confirmar la nueva radicación", categoria: "Radicación o reradicación" },
  { titulo: "Aplicar el cruce en el módulo de aplicación", categoria: "Aplicación o cruce en SAP" },
  { titulo: "Llamar antes del vencimiento", categoria: "Acuerdo de pago" },
  { titulo: "Solicitar el detalle de pago al cliente", categoria: "Conciliación de saldos" },
  { titulo: "Recibir el acta de la transportadora", categoria: "Reclamación a logística" },
  { titulo: "Reprogramar con soporte", categoria: "Acuerdo de pago" },
  { titulo: "Validar que el saldo quede en cero", categoria: "Aplicación o cruce en SAP" },
  { titulo: "Enviar el estado de cuenta al área de pagos", categoria: "Correo o seguimiento escrito" },
  { titulo: "Agendar cita de conciliación", categoria: "Visita o reunión" },
  { titulo: "Escalar el caso al coordinador", categoria: "Escalamiento interno" },
  { titulo: "Adjuntar los soportes al caso", categoria: "Documentación y soportes" }
];

/**
 * Vencimientos de los tickets abiertos que no cuelgan de una novedad. Cubren a
 * propósito los cinco carriles del tablero: vencido, hoy, esta semana y después.
 */
const DEADLINE_OFFSETS = [-14, -6, 0, 2, 5, 9, 24];

/**
 * Tickets de un grupo. Deriva de su índice, sin aleatoriedad, igual que el
 * resto del archivo. Sólo abre uno nuevo si el grupo no traía ya uno abierto.
 */
function derivarTickets(
  nov: NovedadSeed | undefined,
  ejecutivo: IWalletPerson,
  yaEscritos: IWalletTicket[],
  i: number
): IWalletTicket[] {
  const base = 2400 + i * 7;
  const responsable = nov?.responsable ?? ejecutivo;
  const accion = (k: number) => ACCIONES[(i * 3 + k) % ACCIONES.length];
  const tickets: IWalletTicket[] = [];

  // Lo que queda por hacer: uno solo, el que marca el compromiso del grupo.
  const abrir = nov ? true : i % 3 !== 0;
  if (abrir && !yaEscritos.some((t) => t.estado === "abierto")) {
    const a = accion(0);
    tickets.push({
      id: `TK-${base + 1}`,
      titulo: a.titulo,
      categoria: a.categoria,
      responsable,
      deadline: nov ? nov.compromiso : dias(HOY, DEADLINE_OFFSETS[i % DEADLINE_OFFSETS.length]),
      estado: "abierto"
    });
  }

  // Historial: uno siempre en las novedades, y en el resto uno de cada dos.
  const resueltos = nov ? 1 + (i % 3 === 0 ? 1 : 0) : i % 2 === 0 ? 1 : 0;
  for (let k = 0; k < resueltos; k++) {
    const a = accion(k + 1);
    const deadline = dias(HOY, -(8 + ((i * 5 + k * 11) % 22)));
    tickets.push({
      id: `TK-${base + 2 + k}`,
      titulo: a.titulo,
      categoria: a.categoria,
      responsable,
      deadline,
      estado: "resuelto",
      // Uno de cada tres se cerró después del compromiso: alimenta "fuera de fecha".
      resueltoEl: dias(deadline, (i + k) % 3 === 0 ? 2 : -1)
    });
  }

  return tickets;
}

/** Un detalle por grupo: sin él, el botón de abrir gestión no haría nada. */
function derivarDetalles(
  grupos: IWalletGroupRow[],
  rows: IWalletClientRow[]
): Record<string, IWalletGroupDetail> {
  const clientePorId = new Map(rows.map((c) => [c.id, c]));

  return Object.fromEntries(
    grupos.map((g, i) => {
      const cliente = clientePorId.get(g.clienteId)!;
      const nov = g.tipo === "novedad" ? NOVEDAD_POR_ID[g.clave] : undefined;
      const ejecutivo = EJECUTIVO_POR_CLIENTE[g.clienteId];
      const narrativa = NARRATIVA[g.clave] ?? SIN_NARRATIVA;

      const detalle: IWalletGroupDetail = {
        clave: g.clave,
        tipo: g.tipo,
        novedad: nov && {
          id: nov.id,
          tipoNom: nov.detalle,
          estado: nov.estado,
          compromiso: nov.compromiso,
          limite: nov.limite,
          responsable: nov.responsable,
          cerrada: false
        },
        cliente: { nombre: cliente.nombre, nit: cliente.nit },
        ejecutivo,
        monto: g.monto,
        tramos: g.tramos,
        facturas: buildInvoices(g.clave, g.tramos, g.facturas, 1000 + i * 100),
        diasSinGestion: g.diasSinGestion,
        bitacora: narrativa.bitacora,
        tickets: [...narrativa.tickets, ...derivarTickets(nov, ejecutivo, narrativa.tickets, i)]
      };

      return [g.clave, detalle];
    })
  );
}

export const WALLET_GROUP_DETAILS: Record<string, IWalletGroupDetail> = derivarDetalles(
  WALLET_GROUP_ROWS,
  WALLET_CLIENT_ROWS
);
