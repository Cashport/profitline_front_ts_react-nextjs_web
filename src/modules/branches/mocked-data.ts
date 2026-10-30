/* ============================================================
   DATOS SIMULADOS DEL DETALLE — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   El listado ya viene del API. El detalle de la sucursal y sus
   usuarios siguen simulados mientras se define en la base de datos
   cómo se relacionan sucursales y usuarios. Ejemplo del prototipo
   (sucursales-devolucion-v2): cada sucursal arranca con 2–3 usuarios
   de su empresa. Las asignaciones viven en memoria: se pierden al
   recargar la página.
   ============================================================ */
import type { IBranch, IBranchDetail, IBranchUser } from "@/types/branches/IBranches";

/** [nombre, municipio, dirección, lista de precios, precio base, activa] */
type RawBranch = [string, string, string, string, number, boolean];

interface RawClient {
  id: string;
  name: string;
  nit: string;
  /** Dominio del correo de sus usuarios: con él se reparten los usuarios iniciales. */
  domain: string;
  branches: RawBranch[];
}

const CLIENTS: RawClient[] = [
  {
    id: "c1",
    name: "COPIDROGAS",
    nit: "860.000.001-1",
    domain: "copidrogas.co",
    branches: [
      ["CEDI FUNZA", "FUNZA", "KM 1.5 VIA FUNZA-SIBERIA", "Comercial_MM", 7500, true],
      ["BOGOTÁ SUR", "BOGOTA", "AV 1 DE MAYO # 68-20", "Comercial_MM", 7500, true],
      ["MEDELLÍN", "MEDELLIN", "CL 10 # 43A-30", "Comercial_MM", 6800, true],
      ["CALI", "CALI", "AV 6N # 23-61", "Institucional", 5200, false],
      ["BARRANQUILLA", "BARRANQUILLA", "CR 53 # 82-86", "Comercial_MM", 6800, true]
    ]
  },
  {
    id: "c2",
    name: "FEMSA",
    nit: "860.000.002-2",
    domain: "femsa.co",
    branches: [
      ["PLANTA TOCANCIPÁ", "TOCANCIPA", "KM 21 AUTOPISTA NORTE", "Institucional", 9200, true],
      ["CEDI CALLE 80", "BOGOTA", "AV CL 80 # 69-70", "Institucional", 9200, true],
      ["BUCARAMANGA", "BUCARAMANGA", "CL 36 # 27-52", "Comercial_MM", 8100, true],
      ["PEREIRA", "PEREIRA", "AV 30 DE AGOSTO # 40-15", "Comercial_MM", 8100, false],
      ["CARTAGENA", "CARTAGENA", "MAMONAL KM 6", "Institucional", 9200, true]
    ]
  },
  {
    id: "c3",
    name: "COBO MEDICAL",
    nit: "900.000.003-3",
    domain: "cobomedical.co",
    branches: [
      ["SEDE PRINCIPAL", "BOGOTA", "KR 46 # 101B-09", "Institucional", 5000, true],
      ["CHÍA", "CHIA", "KM 2 VIA CHIA-CAJICA", "Institucional", 5000, true]
    ]
  },
  {
    id: "c4",
    name: "MEDISALUD IPS",
    nit: "900.000.004-4",
    domain: "medisalud.co",
    branches: [
      ["SEDE NORTE", "CALI", "CL 44N # 3E-20", "Institucional", 4200, true],
      ["SOACHA", "SOACHA", "CL 13 # 7-45", "Comercial_MM", 3900, false]
    ]
  }
];

/** Usuarios registrados. En producción vienen de la base de datos. */
const USERS: IBranchUser[] = [
  ["u01", "Laura Gómez", "lgomez@copidrogas.co", "Coordinadora de logística"],
  ["u02", "Andrés Rincón", "arincon@copidrogas.co", "Auxiliar de bodega"],
  ["u03", "Paula Méndez", "pmendez@copidrogas.co", "Analista de cartera"],
  ["u04", "Valentina Cruz", "vcruz@copidrogas.co", "Analista de devoluciones"],
  ["u05", "Carolina Pinto", "cpinto@copidrogas.co", "Jefe de cartera"],
  ["u06", "Camilo Restrepo", "crestrepo@femsa.co", "Jefe de bodega"],
  ["u07", "Natalia Ruiz", "nruiz@femsa.co", "Auxiliar de devoluciones"],
  ["u08", "Diana Ortiz", "dortiz@femsa.co", "Analista de logística inversa"],
  ["u09", "Esteban Mora", "emora@femsa.co", "Supervisor de distribución"],
  ["u10", "Daniela Vargas", "dvargas@femsa.co", "Analista comercial"],
  ["u11", "Felipe Arango", "farango@cobomedical.co", "Coordinador de compras"],
  ["u12", "Sofía Herrera", "sherrera@cobomedical.co", "Auxiliar administrativa"],
  ["u13", "Luisa Fernanda Gil", "lgil@cobomedical.co", "Coordinadora de calidad"],
  ["u14", "Sebastián Torres", "storres@cobomedical.co", "Auxiliar de despachos"],
  ["u15", "Juan Pablo Díaz", "jdiaz@medisalud.co", "Regente de farmacia"],
  ["u16", "Mariana León", "mleon@medisalud.co", "Auxiliar de bodega"],
  ["u17", "Ricardo Pardo", "rpardo@medisalud.co", "Jefe de logística"],
  ["u18", "Héctor Salazar", "hsalazar@medisalud.co", "Auxiliar de inventarios"]
].map(([id, name, email, role]) => ({ id, name, email, role }));

/* Sucursales adicionales generadas (15 por cliente) para que la tabla tenga varias
   páginas, como pasará con los miles de registros reales. */
const EXTRA_CITIES = ["BOGOTA", "MEDELLIN", "CALI", "BARRANQUILLA", "BUCARAMANGA", "PEREIRA"];
CLIENTS.forEach((client, c) => {
  for (let n = 1; n <= 15; n++) {
    const city = EXTRA_CITIES[(n + c) % EXTRA_CITIES.length];
    client.branches.push([
      `PUNTO ${city} ${n}`,
      city,
      `CL ${10 + n * 3} # ${20 + c * 5}-${n + 10}`,
      n % 3 === 0 ? "Institucional" : "Comercial_MM",
      4000 + ((n * 700 + c * 350) % 5600),
      n % 5 !== 0
    ]);
  }
});

const BRANCHES: IBranch[] = [];
/** Sucursal → ids de sus usuarios asignados, en orden de asignación. */
const ASSIGNMENTS = new Map<string, string[]>();

CLIENTS.forEach((client) => {
  const pool = USERS.filter((u) => u.email.endsWith(`@${client.domain}`));
  client.branches.forEach(([name, city, address, price_list, base_price, is_active], n) => {
    const id = `${client.id}-${n + 1}`;
    BRANCHES.push({
      id,
      client_id: client.id,
      client_name: client.name,
      client_nit: client.nit,
      name,
      city,
      address,
      price_list,
      base_price,
      is_active
    });
    const picks = [n, n + 1, ...(n % 2 === 0 ? [n + 2] : [])].map((p) => pool[p % pool.length].id);
    ASSIGNMENTS.set(id, [...new Set(picks)]);
  });
});

const usersOf = (branchId: string) =>
  (ASSIGNMENTS.get(branchId) ?? []).map((id) => USERS.find((u) => u.id === id)!);

/** Simula GET /branches/:id. `null` si la sucursal no existe. */
export const getBranchDetailMock = async (branchId: string): Promise<IBranchDetail | null> => {
  const branch = BRANCHES.find((b) => b.id === branchId);
  return branch ? { branch, users: usersOf(branchId) } : null;
};

/** Simula GET /users: todos los usuarios que se pueden asignar. */
export const getUsersMock = async (): Promise<IBranchUser[]> => USERS;

/** Simula POST /branches/:id/users. */
export const addBranchUsersMock = async (branchId: string, userIds: string[]) => {
  const current = ASSIGNMENTS.get(branchId) ?? [];
  ASSIGNMENTS.set(branchId, [...new Set([...current, ...userIds])]);
};

/** Simula DELETE /branches/:id/users/:userId. */
export const removeBranchUserMock = async (branchId: string, userId: string) => {
  ASSIGNMENTS.set(
    branchId,
    (ASSIGNMENTS.get(branchId) ?? []).filter((id) => id !== userId)
  );
};
