// Mock de los grupos de clientes asignados a un usuario del Market Admin.
// El backend aún no expone endpoints para asignar/quitar un grupo a un usuario
// (`/group-client/user/:id/project/:id` solo lee), así que el tab de Grupos
// trabaja contra estos datos en memoria hasta que existan.

export type TipoGrupo = "Con cartera" | "Sin cartera" | "Virtual";

export interface GrupoCliente {
  id: string;
  nombre: string;
  tipo: TipoGrupo;
  clientes: number;
  activo: boolean;
}

export const GRUPOS_MOCK: GrupoCliente[] = [
  { id: "g1", nombre: "Clientes con cartera", tipo: "Con cartera", clientes: 8, activo: true },
  { id: "g2", nombre: "Clientes sin cartera", tipo: "Sin cartera", clientes: 4, activo: true },
  { id: "g3", nombre: "VIP Estética Bogotá", tipo: "Virtual", clientes: 5, activo: true },
  { id: "g4", nombre: "Clientes inactivos 90 días", tipo: "Virtual", clientes: 3, activo: false },
  { id: "g5", nombre: "Retail Zona Norte", tipo: "Virtual", clientes: 6, activo: true }
];

// Grupos con los que arranca cada usuario, por id de ruta.
export const GRUPOS_POR_USUARIO_INIT: Record<string, string[]> = {
  "1": ["g1"],
  "2": ["g1", "g3"],
  "5": ["g2"]
};

export const DEFAULT_GRUPOS_USUARIO: string[] = [];

export const TIPO_GRUPO_STYLES: Record<string, string> = {
  "Con cartera": "bg-[#E8F0FF] text-[#2252CC]",
  "Sin cartera": "bg-[#FFF3E0] text-[#B26A00]",
  Virtual: "bg-[#F3E8FF] text-[#7C2ED6]"
};
