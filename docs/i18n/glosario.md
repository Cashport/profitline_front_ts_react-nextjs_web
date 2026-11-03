# Glosario español → inglés de Cashport

Copia técnica del glosario del Brain de Cashport (`Cashport Brain/00-vision/glosario.md`), que es la
fuente de verdad de los términos de negocio: si difieren, gana el Brain. Aquí además están los términos
de interfaz (botones, columnas, mensajes). Un término nuevo se pregunta a los líderes de producto antes
de usarlo (regla MOD-014; ver `docs/i18n/README.md`, sección "Términos nuevos").

Se construyó con el Brain de
Cashport (`00-vision/glosario.md`, `01-modulos/*`) y con los textos reales de la interfaz y de
los catálogos de la base (`invoice_incident_motive`). La regla: traducir el **concepto de
negocio** como lo nombra el mercado de cuentas por cobrar / O2C en inglés, nunca la palabra
literal.

- **✅ Confirmado**: término estándar del mercado, sin ambigüedad. Se usa tal cual.
- **Decidido por el equipo**: había más de una opción razonable y el equipo eligió una.

Convenciones de estilo del inglés: inglés de EE. UU. (`canceled`, `color`); títulos de módulo
en *Title Case* ("Cash Application"); botones, columnas y etiquetas en *Sentence case*
("Due date", "Apply payment"); tono directo y en segunda persona ("Select a customer").

## Decididos por el equipo (2026-11-02)

| Español | Inglés | Formas derivadas usadas en la interfaz |
|---|---|---|
| **Novedad / Novedades** (cartera) | **Dispute / Disputes** | Fuera de cartera la novedad no es una disputa: ver la tabla de términos nuevos. |
| **Saldo / Saldos** (módulo y concepto) | **Deduction / Deductions** | Lo que el cliente se toma o descuenta (*short-pay*), como en *Deduction Management* de HighRadius. "Saldos pendientes" → *Pending deductions*; "Legalizar saldo" → *Resolve deduction*; "Marcar como saldo" → *Mark as deduction*. Cuando "saldo" es lo que falta por pagar de una factura se usa *Outstanding / Open amount*. Cambió de *Open item* el 2026-11-03 tras comparar con HighRadius. |
| **Legalizar / Legalización** (de saldos) | **Resolve / Resolution** | "Por legalizar" → *Pending resolution*; "Legalizada" → *Resolved*. Para ajustes contables y la pestaña "Legalizaciones" de Bancos se mantiene *Settle / Settlement* (otra acepción: aplicar el documento del ERP). |
| **Nota crédito / Nota débito** | **Credit memo / Debit memo** | |
| **Cuentas médicas** | **Medical Billing** (módulo) | Una cuenta médica → *medical bill*. |
| **Radicación / Radicar / Radicada** | **Invoice submission / Submit / Submitted** | "Número de radicado" → *Filing number*. |
| **Alertas de bloqueo** | **Credit Hold Alerts** | |
| **Torre de recaudo** | **Collections Control Tower** | |
| **Bonificado / Bonificación** | **Free goods** | |
| **Holding** | **Corporate group** | |
| **Proveedores** | **Suppliers** | |
| **Comunicaciones masivas** | **Campaigns** | |
| **Glosa / Glosada** (salud) | **Medical claim** | "Ver glosas" → *View medical claims*; el estado "Glosado" → *Medical claim*. No confundir con el módulo **Medical Billing** (cuentas médicas). |
| **Saldo a favor** | **Overpayment** | Saldo negativo: el cliente pagó de más. |
| **Gestión** (de cobro) | **Collection activity / Activity** | En el menú, el grupo "Gestión" se traduce **Management**. |

### Términos que aparecieron al traducir los módulos (confianza media)

| Español | Inglés usado | Dónde / nota |
|---|---|---|
| Novedad (fuera de cartera) | **Issue** en Órdenes de compra, Cuentas médicas y Data Quality; **Mismatch** en Conciliación | Ahí no es una disputa del cliente sino una inconsistencia detectada (de la IA, de la carga o del monto). Solo cartera usa "Dispute". |
| Saldo (monto restante de una factura) | **Outstanding** / **Open amount** | No es el concepto "Saldos" del módulo; es lo que falta por pagar. |
| Monto / Valor inicial | **Original amount** | |
| Ejecutivo | **Collector** (cartera); **Field rep** (Precintos) | En Marketplace podría ser *account executive*. |
| Generar acción | **Take action** | Botón que abre el menú de acciones. |
| Depuración / Pendiente compensación (SAP) | **Clearing** / **Pending clearing** | Término SAP para compensar partidas abiertas. |
| Compensada (estado) | **Offset** | Sigue a Cruce → Offset. |
| Trazabilidad | **Activity history** | Línea de tiempo de eventos. |
| Tirilla | **Deposit slip** | Comprobante del banco o la caja que se sube como soporte. |
| Archivo plano / Plano de facturación | **Flat file** / **Billing file** | Archivo txt/csv para el ERP. |
| Circularización | "communication" | En auditoría es *balance confirmation*; la interfaz lo presenta como comunicación masiva. |
| Gerencia (filtro de la torre) | **Division** | Nivel por encima del coordinador. |
| Vigencia (documento, formulario) | **Validity period** | |
| Régimen (Contributivo / Subsidiado) | **Health plan** (Contributory / Subsidized) | Régimen de salud colombiano sin equivalente exacto. |
| EPS | **Insurer (EPS)** | |
| Cupo (como tipo de pago) / Contado | **Credit** / **Cash** | |
| Regalo / Premio (promociones) | **Reward** | Distinto de *free goods*. |
| Acumulable (promoción) | **Stackable** | |
| Nivel / escalón (promoción) | **Tier** | |
| Ingesta | **Intake** (la fuente configurada) / **Ingestion** (el proceso) | Data Quality. |
| Corte (de la foto de datos) | **As of** / **Snapshot** | "Corte — 2 nov" → "As of — Nov 2". |
| Proyectar a cierre | **Project to month-end** | |
| Aviso de vencimiento | **Due date reminder** | |
| Lote | **Lot** | Alternativa: *Batch*. |
| Razón social | **Legal name** | |
| A N días (condición de pago) | **Net N days** | Convención de EE. UU. |

## ✅ Confirmados

### Cartera y cobranza
| Español | Inglés |
|---|---|
| Cartera como área o módulo (menú, título, pestaña del cliente) / Cartera como monto (lo que se debe) | **Collections** / **Receivables** ("AR" donde no hay espacio): "Total cartera" → *Total receivables*, "Cartera vencida" → *Past-due receivables*. Decidido por el equipo el 2026-11-03 |
| Cartera por edad / Antigüedad de cartera | AR Aging / Aging |
| Corriente (rango de edad) | Current |
| Vencida / Vencido | Past due |
| Por vencer | Not yet due |
| Días de mora | Days past due (DPD) |
| Mora | Delinquency |
| Fecha de vencimiento | Due date |
| Cupo / Cupo disponible | Credit limit / Available credit |
| Cobranza | Collections |
| Recaudo (dinero recaudado) / grupo "Recaudo" del menú | **Collected** / **Cash collected** en montos y gráficas ("Recaudo del mes" → *Collected this month*); el grupo del menú es **Payments**. Nunca *Collections*, que ya es el área de cartera. La Torre de recaudo sigue como *Collections Control Tower* |
| Ejecutivo de cobranza / Gestor | Collector |
| Asesor / Vendedor (comercial) | Sales rep |
| Coordinador | Coordinator |
| Compromiso de pago | Payment agreement (decidido por el equipo el 2026-11-03; hoy ninguna pantalla lo muestra: el "Compromiso" de los tickets de novedades es *Commitment*) |
| Acuerdo de pago | Payment plan |
| Estado de cuenta | Account statement |
| Meta | Target |
| Presupuesto | Budget |
| Cliente | Customer |
| Grupo de clientes | Customer group |
| Punto de venta | Point of sale |
| Canal / Línea / Sublínea / Zona | Channel / Product line / Subline / Zone |
| Proyecto (empresa en Cashport) | Project |

### Pagos, bancos y conciliación
| Español | Inglés |
|---|---|
| Aplicación de pagos | Cash Application |
| Aplicar pago | Apply payment |
| Pago no aplicado (PNA) | Unapplied payment (unapplied cash) |
| Pago identificado / no identificado | Identified / Unidentified payment |
| Movimiento bancario | Bank transaction |
| Extracto bancario | Bank statement |
| Soporte de pago / Soporte de egreso | Remittance advice (en botones: "Remittance") |
| Soporte (documento adjunto en general) | Supporting document |
| Abono | Partial payment |
| Anticipo | Advance payment |
| Conciliación | Reconciliation |
| Cruce (de cuentas / de saldos) | Offset |
| Ajuste contable | Accounting adjustment |
| Descuento / Descuento financiero (pronto pago) | Discount / Early payment discount |
| Retención (en la fuente / ICA / IVA) | Withholding (income tax / ICA / VAT) |
| IVA | VAT |
| NIT | Tax ID |
| TRM | Exchange rate |
| Pasarela de pagos / Link de pago | Payment gateway / Payment link |

### Pedidos, facturación y logística
| Español | Inglés |
|---|---|
| Factura | Invoice |
| Facturación / Facturador | Billing / Billing specialist |
| Refacturación | Rebilling |
| Anulada | Voided |
| Pedido | Order |
| Orden de compra (OC) | Purchase order (PO) |
| Backorder | Backorder |
| Despacho / Entrega | Dispatch / Delivery |
| Bodega | Warehouse |
| Devolución | Return |
| Logística inversa | Reverse Logistics |
| Precintos | Seals |
| Faltante / Avería | Shortage / Damaged goods |

### Plataforma
| Español | Inglés |
|---|---|
| Aprobaciones | Approvals |
| Tareas / Ticket | Tasks / Ticket |
| Informes | Reports |
| Encuestas | Surveys |
| Visitas | Visits |
| Configuración | Settings |
| Torre de control | Control Tower |
| Cargar (archivo) | Upload |
| Marketplace, Data Quality, Bots, WhatsApp, Mail, Dashboard | Igual (nombres propios o ya en inglés) |
| Cerrar sesión | Sign out |

## Lo que la traducción del front NO cubre

- **Datos que vienen de la base o del backend**: motivos de novedad, estados configurables,
  nombres de páginas/roles, tipos de documento, plantillas de correo y WhatsApp, mensajes de
  error que devuelve el API. Se muestran como llegan (hoy en español). Para tenerlos en inglés
  hay que agregar la traducción en los catálogos de la base y que el backend responda según el
  encabezado `Accept-Language`, que el front ya envía en cada llamada.
- **Formatos de números y moneda**: los define la moneda que se muestra (ver la HU de
  multimoneda), no el idioma. Las fechas conservan día/mes/año; solo cambian los nombres de
  meses y días.
