import { AsignacionManual } from "@/types/marketAdmin/IMarketAdmin";

// Datos de ejemplo (en memoria). Reemplazar por un GET cuando exista el endpoint de listado.
export const ASIGNACIONES_INICIALES: AsignacionManual[] = [
  {
    id: "a1",
    clienteId: "900123456",
    clienteNombre: "Clínica Dermatológica Piel Sana",
    clienteNit: "900.123.456-7",
    productoBonificadoId: "b1",
    productoBonificadoNombre: "SCULPTRA INJPRO 2 VIAL",
    unidadesAsignadas: 10,
    unidadesDisponibles: 6,
    estado: "aprobado",
    creadoEn: "2026-04-10",
    nota: "Premio por volumen Q1"
  },
  {
    id: "a2",
    clienteId: "800987654",
    clienteNombre: "Centro Médico Estético Galderma",
    clienteNit: "800.987.654-3",
    productoBonificadoId: "b2",
    productoBonificadoNombre: "RESTYLANE SB VITAL LIDO 1ml",
    unidadesAsignadas: 5,
    unidadesDisponibles: 5,
    estado: "pendiente",
    creadoEn: "2026-04-18",
    nota: ""
  },
  {
    id: "a3",
    clienteId: "901234567",
    clienteNombre: "Dermatología Avanzada S.A.S.",
    clienteNit: "901.234.567-1",
    productoBonificadoId: "b7",
    productoBonificadoNombre: "RESTYLANE KYSSE 1ml",
    unidadesAsignadas: 8,
    unidadesDisponibles: 0,
    estado: "rechazado",
    creadoEn: "2026-04-05",
    nota: "Solicitud revisada y rechazada por gerencia"
  }
];
