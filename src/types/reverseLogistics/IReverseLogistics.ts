// Domain types for the reverse-logistics (devoluciones) module.
// Field names are kept in Spanish to match the source data shape 1:1.

export type CausalDevolucion =
  | "Vencimiento"
  | "Vencimiento fuera política sin reconocimiento NC"
  | "Avería"
  | "Error en pedido"
  | "Retiro voluntario"
  | "Garantía";

export type EstadoDevolucion =
  | "Visita programada"
  | "Visita en curso"
  | "En aprobación"
  | "Demora de aprobación"
  | "Aprobado / Rechazado"
  | "Red generada"
  | "Recogido"
  | "Entregado"
  | "Movimiento Odoo"
  | "Contabilización de NC";

// One entry from the Profit360 `Causales` JSON blob. `RGB` is a bare hex string
// with no leading "#" (e.g. "32417A").
export interface IProfit360Causal {
  Id: string;
  causal: string;
  RGB: string;
}

export interface ICalculatedStatus {
  id: string;
  label: string;
  textColor: string;
  backgroundColor: string;
  badgeColor: string;
}

export interface IReturn {
  id: number;
  idBoleto: string;
  fecha: string;
  cliente: string;
  direccionCliente: string;
  canal: string;
  lineaNegocio?: string;
  unidades: number;
  causal: CausalDevolucion;
  embalaje: string;
  precintos: number;
  monto: number;
  usuario: string;
  estado: EstadoDevolucion;
  pdfUrl?: string;
}

export interface ReturnRow {
  key: string;
  isGroup: boolean;
  devCount: number;
  id: number;
  idBoleto: string;
  fecha: string;
  cliente: string;
  direccionCliente: string;
  canal: string;
  lineaNegocio?: string;
  unidades: number;
  causales?: IProfit360Causal[];
  monto: number;
  estado: EstadoDevolucion;
  pdfUrl?: string;
  haveApprove: boolean;
  idDevolucion?: string;
  calculatedStatus?: ICalculatedStatus;
  // Reference to the original API devolucion so the actions column can
  // navigate to the approval detail (`IdDevolucion` doubles as the approval
  // id used in /aprobaciones/:id and /returns/:returnId/approve).
  originalDev?: IProfit360VisitDevolucion;
  children?: Omit<ReturnRow, "children">[];
}

export type TipoAprobacion =
  | "Fuera de politicas por fecha (01-vencimiento)"
  | "Causal con aprobación (04-Calidad)"
  | "Supera el monto máximo"
  | "Sin autorización de recogida";

export interface IApproval {
  id: number;
  cliente: string;
  codigoCliente: string;
  canal: string;
  linea: string;
  ciudad: string;
  fecha: string;
  tiposAprobacion: TipoAprobacion[];
  lotesParaAprobar: number;
  unidades: number;
  monto: number;
}

export interface IApprovalProduct {
  id: string;
  nombre: string;
  ean: string;
  sku: string;
  imageUrl?: string;
  politica: string;
  politicaColor: "green" | "orange" | "red";
  lote: string;
  fechaVencimiento: string;
  unidades: number;
  valor: number;
  documento: string;
  estado: string;
}

// Shape returned by GET /integration/profit360/approvals?from=YYYY-MM-DD. The
// endpoint returns GUID-string ids, ISO timestamps and a few nested JSON blobs
// (bloqueos, causales); we expose only the fields the list/detail views need.
export interface IProfit360Approval {
  id: string;
  idContacto: string;
  nombre: string;
  idCliente: string;
  codigoCliente: string;
  cliente: string;
  idSucursalLogistica: string;
  sucursal: string;
  idMunicipio: string;
  municipio: string;
  idProyectoLogistica: string;
  proyecto: string;
  idLineaNegocio: string;
  lineaNegocio: string;
  idCanal: string;
  canal: string;
  fechaInicioDevolucion: string;
  fechaFinDevolucion: string;
  fotosProductos: string | null;
  fotosEmbalaje: string | null;
  valorTotalDocumento: number | null;
  cantidad: number | null;
  precintos: number | null;
  idEmbalaje: string | null;
  idBoleto: string | null;
  pdfBoleto: string | null;
  observacion: string;
  idEstado: string;
  estado: string;
  fechaRegistro: string;
  usuarioRegistro: string;
  fechaModificado: string;
  usuarioModifico: string;
  lotesPorAprobar: number;
  bloqueos: string | null;
  fotosAprobacion: string | null;
  observacionAprobacion: string;
  idEstadoAprobacion: string;
  fechaRegistroAprobacion: string;
  causales: string | null;
}

// Single document (producto x documento) inside an approval resumen.
export interface IProfit360Documento {
  id: string;
  idProducto: string;
  idProductoxDocumento: string;
  sku: string;
  descripcionProducto: string;
  ean: string;
  fotoProducto: string | null;
  lote: string;
  fechaLote: string;
  unidadesProductoxDocumento: number;
  valor: number;
  numeroDocumento: string;
  fechaDocumento: string;
  fechaRegistroDocumento: string;
  usuarioRegistroDocumento: string;
  descripcionCausalProductoxDocumento: string;
  descripcionBloqueo: string;
  colorBloqueo: string;
  descripcionEstadoProductoxDocumento: string;
  observacionProductoxDocumento: string;
  observacionAprobacion: string;
  idCausalDocumento: string;
}

// Block / rule summary (the 5% devoluciones / venta mensual rule).
export interface IProfit360ReglaDevoluciones {
  reglaDescripcion: string;
  porcentajeLimite: number;
  ventasMensualesBase: number;
  maximoPermitido: { valor: number; descripcion: string };
  devolucionesEsteMes: { porcentaje: number; valorAcumulado: number };
  conEstaAprobacion: { porcentaje: number; excedente: number };
  superaLimitePermitido: boolean;
}

// Shape returned by GET /integration/profit360/approvals/{id}/resumen — full
// approval detail incl. documents (productos x documento) and the rule summary.
export interface IProfit360ApprovalResumen {
  id: string;
  idContacto: string;
  nombre: string;
  idCliente: string;
  codigoCliente: string;
  cliente: string;
  idSucursalLogistica: string;
  sucursal: string;
  idMunicipio: string;
  municipio: string;
  idProyectoLogistica: string;
  proyecto: string;
  idLineaNegocio: string;
  lineaNegocio: string;
  idCanal: string;
  canal: string;
  fechaInicioDevolucion: string;
  fechaFinDevolucion: string;
  valorTotalDocumento: number | null;
  cantidad: number | null;
  precintos: number | null;
  idBoleto: string | null;
  pdfBoleto: string | null;
  observacion: string;
  estado: string;
  fechaRegistro: string;
  usuarioRegistro: string;
  fechaModificado: string;
  usuarioModifico: string;
  lotesPorAprobar: number;
  bloqueos: string | null;
  fotosAprobacion: string | null;
  observacionAprobacion: string;
  idEstadoAprobacion: string;
  fechaRegistroAprobacion: string;
  causales: string | null;
  documentos: IProfit360Documento[];
  reglaDevoluciones: IProfit360ReglaDevoluciones;
  superaLimitePermitido: number; // 0 = no, 1 = yes
  isLogisticAdmin: boolean;
}

// Single devolución (return) attached to a visit in the visits endpoint.
export interface IProfit360VisitDevolucion {
  Id: string;
  IdDevolucion: string;
  IdContacto: string;
  Nombre: string;
  IdClienteManager: number;
  IdCliente: string;
  CodigoCliente: string;
  Cliente: string;
  IdSucursalManager: number;
  IdSucursalXProyectoManager: number;
  IdSucursalLogistica: string;
  Sucursal: string;
  IdMunicipio: string;
  Municipio: string;
  IdProyectoLogistica: string;
  Proyecto: string;
  IdLineaNegocio: string;
  LineaNegocio: string;
  IdCanal: string;
  Canal: string;
  FechaInicioDevolucion: string;
  FechaFinDevolucion: string;
  FotosProductos: string | null;
  FotosEmbalaje: string | null;
  ValorTotalDocumento: number | null;
  Cantidad: number | null;
  Precintos: number | null;
  IdEmbalaje: string | null;
  IdBoleto: string | null;
  PdfBoleto: string | null;
  Observacion: string;
  IdEstado: string;
  Estado: string;
  FechaRegistro: string;
  UsuarioRegistro: string;
  FechaModificado: string;
  UsuarioModifico: string;
  IdDocumento: string;
  NumeroDocumento: string;
  FechaDocumento: string;
  Unidades: number;
  MontoDocumento: number;
  IdCausalDocumento: string;
  Foto: string | null;
  ObservacionDocumento: string;
  EstadoDocumento: string;
  FechaRegistroDocumento: string;
  UsuarioRegistroDocumento: string;
  ValorDocumento: number;
  UnidadesDocumento: number;
  UnidadesRegistradas: number;
  SuperaMontoLimite: number;
  ColorCausal: string;
  IdCausalDevolucion: string;
  DescripcionCausalDev: string;
  // JSON blob: {"Causales":[{"Id":"…","causal":"Vencimiento","RGB":"32417A"}]}
  Causales: string | null;
  FotosAprobacion: string | null;
  ObservacionAprobacion: string;
  IdEstadoAprobacion: string;
  FechaRegistroAprobacion: string;
  IdAprobacion: string | null;
  /**
   * Estados / fases por las que pasó la devolución (`DevolucionPaso` join
   * `DevolucionFase`). Se rellenan en `VisitsService.fetchDevolucionesForVisits`
   * haciendo match por `Id` contra el resultado de `getDevolucionesFase`.
   */
  fases?: DevolucionesEstados[];
}

export interface DevolucionesEstados {
  Id: string;
  IdPasoDestino: number;
  FechaIngreso: Date;
  FechaSalida: Date;
  DuracionDias: number;
  Codigo: TipoDevolucionCodigo;
}

export enum TipoDevolucionCodigo {
  F1_LOGISTICA = "F1_LOGISTICA",
  F2_SOLISTICA = "F2_SOLISTICA",
  F3_SUPPLA = "F3_SUPPLA",
  F4_NOTA_CREDITO = "F4_NOTA_CREDITO"
}

// Visit returned by GET /integration/profit360/visits?page=&fromDate=&toDate=&limit=
// Each visit carries its own `returns` / `devoluciones` arrays.
export interface IProfit360Visit {
  visitId: string;
  visitProjectId: string;
  scheduledDate: string;
  scheduledTime: string;
  endTime: string;
  clientId: number;
  clientName: string;
  status: string;
  durationMinutes: number;
  responsibleUserId: string;
  responsibleUserName: string;
  IdProyectoLogistica: string;
  returns: unknown[];
  devoluciones: IProfit360VisitDevolucion[];
  calculatedStatus: ICalculatedStatus;
}

// Paginated response wrapper for the visits endpoint.
export interface IProfit360VisitsResponse {
  data: IProfit360Visit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Single picklist item returned by /integration/profit360/filtros-devolucion — `codigo`
// is a stable identifier (GUID) and `nombre` is the human-readable label.
export interface IProfit360FilterItem {
  codigo: string;
  nombre: string;
}

// Shape returned by GET /integration/profit360/filtros-devolucion — dropdown options for
// cliente / estado / causal across the devoluciones + aprobaciones tabs.
export interface IProfit360Filters {
  clientes: IProfit360FilterItem[];
  estados: IProfit360FilterItem[];
  causales: IProfit360FilterItem[];
}

// Body shape for POST /integration/profit360/returns/:returnId/approve.
// All GUIDs come from the filters endpoint; `idDevolucion` and
// `idProductoxDocumentos` come from the devolucion payload, and
// `causalOriginal` is the causal GUID the devolucion already carried.
export interface IApproveReturnRequest {
  idDevolucion: string;
  idProductoxDocumentos: string[];
  estado: string;
  observaciones: string;
  causal: string;
  causalOriginal: string;
}

// ── KPIs de devolución ────────────────────────────────────────────────────────
// GET /integration/profit360/kpis-devolucion — average days spent on each phase
// of the devolución flow, plus the end-to-end total. `promedioDias` is what the
// stats bar renders; min/max/muestras are available for tooltips later.
export interface IProfit360DevolucionKpiFase {
  codigo: string;
  nombre: string;
  orden: number;
  pasoOrigen: number | null;
  pasoDestino: number | null;
  // Nullable: the backend omits a measure when it has no samples for it.
  promedioDias: number | null;
  minDias: number | null;
  maxDias: number | null;
  muestras: number | null;
}

export interface IProfit360DevolucionKpis {
  fases: IProfit360DevolucionKpiFase[];
  total: {
    promedioDias: number | null;
    muestras: number | null;
  };
  filtrosAplicados?: {
    idProyectoProfitLine?: string;
    clientId?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
  };
}
