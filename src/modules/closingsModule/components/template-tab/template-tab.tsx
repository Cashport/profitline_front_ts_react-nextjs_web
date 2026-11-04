"use client";

import { useState } from "react";

import type { IClosingInfo } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { formatDate, periodLabel } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";

type Need = "Obligatoria" | "Recomendada" | "Opcional";

interface TemplateColumn {
  name: string;
  /** Encabezado con que llega hoy en el Excel de FEMSA, para mapear. */
  source: string;
  need: Need;
  description: string;
  example: string;
  usedIn: string;
}

/* Propuesta de plantilla única para todos los proyectos. Es un borrador para iterar con la
   maqueta: sale de las columnas del Excel de cierre que hoy se arma a mano. */
const SHEETS: Record<string, { help: string; columns: TemplateColumn[] }> = {
  Cartera: {
    help: "Un renglón por documento abierto al corte, tal como sale del ERP de la compañía (SAP u otro). Es la foto oficial del cierre.",
    columns: [
      {
        name: "Periodo",
        source: "Periodo",
        need: "Obligatoria",
        description: "Mes del cierre (cualquier día del mes).",
        example: "2026-10-01",
        usedIn: "Selector de cierre"
      },
      {
        name: "NIT",
        source: "NIT",
        need: "Obligatoria",
        description: "NIT del cliente sin dígito de verificación.",
        example: "9002657300",
        usedIn: "Todo"
      },
      {
        name: "Nombre",
        source: "Nombre",
        need: "Obligatoria",
        description: "Razón social del cliente.",
        example: "ALMACENES ANDINA S.A.S.",
        usedIn: "Tablas"
      },
      {
        name: "N° documento",
        source: "Nº doc.",
        need: "Obligatoria",
        description: "Número del documento en el ERP.",
        example: "1222002531",
        usedIn: "Conteo de documentos"
      },
      {
        name: "Tipo",
        source: "Tipo",
        need: "Obligatoria",
        description: "Factura, NC, ND, Saldos, Pago o Pendiente.",
        example: "Factura",
        usedIn: "Cartera, notas y saldos"
      },
      {
        name: "Importe",
        source: "Importe en MD",
        need: "Obligatoria",
        description: "Saldo abierto en moneda del documento. Negativo para notas y pagos.",
        example: "14907",
        usedIn: "Todo"
      },
      {
        name: "Fecha documento",
        source: "Fecha doc/",
        need: "Obligatoria",
        description: "Fecha de emisión.",
        example: "2026-07-17",
        usedIn: "Antigüedad"
      },
      {
        name: "Fecha vencimiento",
        source: "Venc/neto",
        need: "Obligatoria",
        description: "Vencimiento neto del documento.",
        example: "2026-08-16",
        usedIn: "Tramos"
      },
      {
        name: "Vencimiento",
        source: "Vencimiento",
        need: "Recomendada",
        description:
          "Tramo que reporta la compañía: Corriente, 0-30, 31-60, 61-90, 91-120, +120. Si no viene, se calcula con la fecha de vencimiento y el corte.",
        example: "0-30",
        usedIn: "Edades"
      },
      {
        name: "Segmento",
        source: "Segmento",
        need: "Recomendada",
        description: "Causal de la nota: Negociaciones, Devolución, Averia, Pendiente.",
        example: "Negociaciones",
        usedIn: "Notas por causal"
      },
      {
        name: "Tipo saldo",
        source: "Tipo saldo",
        need: "Recomendada",
        description: "Causal del saldo abierto (cuando Tipo = Saldos).",
        example: "Por clasificar",
        usedIn: "Saldos por causal"
      },
      {
        name: "Descripción",
        source: "Descripcion",
        need: "Opcional",
        description: "Tipo de cartera: crédito formal o informal / contado.",
        example: "FT Crédito formal",
        usedIn: "Filtro Tipo de cartera"
      },
      {
        name: "Canal",
        source: "GERENCIA",
        need: "Recomendada",
        description: "Canal o gerencia comercial.",
        example: "HOME MARKET",
        usedIn: "Gráficas por canal"
      },
      {
        name: "Gerente comercial",
        source: "GERENTE COMERCIAL",
        need: "Opcional",
        description: "Responsable comercial del canal.",
        example: "CAROLINA MESA",
        usedIn: "Filtros"
      },
      {
        name: "Ejecutivo comercial",
        source: "EJECUTIVO COMERCIAL",
        need: "Recomendada",
        description: "Vendedor del cliente. Base para comisiones.",
        example: "VIVIANA ROJAS",
        usedIn: "Cartera por ejecutivo"
      },
      {
        name: "Ejecutivo de cartera",
        source: "Ejecutivo",
        need: "Recomendada",
        description: "Analista de cartera que gestiona al cliente.",
        example: "Cristina Ospina",
        usedIn: "Cartera por ejecutivo"
      },
      {
        name: "Coordinador",
        source: "Coordinador",
        need: "Opcional",
        description: "Coordinador de cartera.",
        example: "Germán Torres",
        usedIn: "Filtros"
      },
      {
        name: "Holding",
        source: "HOLDING",
        need: "Opcional",
        description: "Grupo empresarial del cliente.",
        example: "CADENA ANDINA",
        usedIn: "Filtros"
      },
      {
        name: "Ciudad",
        source: "Ciudad",
        need: "Opcional",
        description: "Ciudad del cliente.",
        example: "BOGOTA",
        usedIn: "Filtros"
      }
    ]
  },
  Pagos: {
    help: "Recaudo del mes del cierre, con el estado en que lo dejó la compañía al corte. Explica la diferencia con lo aplicado en Cashport.",
    columns: [
      {
        name: "Periodo",
        source: "Periodo",
        need: "Obligatoria",
        description: "Mes del recaudo.",
        example: "2026-10-01",
        usedIn: "Recaudo"
      },
      {
        name: "NIT",
        source: "NIT",
        need: "Obligatoria",
        description: "NIT del cliente.",
        example: "9004805691",
        usedIn: "Recaudo por cliente"
      },
      {
        name: "Cliente",
        source: "Cliente",
        need: "Obligatoria",
        description: "Razón social.",
        example: "SUPERMERCADOS DEL VALLE S.A.",
        usedIn: "Tablas"
      },
      {
        name: "N° documento",
        source: "Nº doc.",
        need: "Obligatoria",
        description: "Documento del pago en el ERP.",
        example: "300143896",
        usedIn: "Trazabilidad"
      },
      {
        name: "Fecha",
        source: "Fe/contab/",
        need: "Obligatoria",
        description: "Fecha contable del pago.",
        example: "2026-10-22",
        usedIn: "Recaudo"
      },
      {
        name: "Importe",
        source: "ImpteML",
        need: "Obligatoria",
        description: "Valor del pago en moneda local.",
        example: "10381801654",
        usedIn: "Recaudo"
      },
      {
        name: "Estado",
        source: "Estado",
        need: "Obligatoria",
        description:
          "Compensado, Pendiente compensación, Revisión doble abono o Enviado anulación.",
        example: "Compensado",
        usedIn: "Recaudo sin aplicar"
      },
      {
        name: "Estado 2",
        source: "Estado 2",
        need: "Opcional",
        description: "Detalle del seguimiento del pago no compensado.",
        example: "Identificado Cashport",
        usedIn: "Recaudo sin aplicar"
      },
      {
        name: "Tipo de pago",
        source: "Tipo de pago",
        need: "Opcional",
        description: "Consignación, Wallet…",
        example: "Consignación",
        usedIn: "Detalle"
      },
      {
        name: "Canal",
        source: "GERENCIA",
        need: "Recomendada",
        description: "Canal del cliente.",
        example: "HOME MARKET",
        usedIn: "Recaudo por canal"
      }
    ]
  },
  Comentarios: {
    help: "Un comentario por cliente y cierre. Se puede cargar en la plantilla o escribir directo en el tablero.",
    columns: [
      {
        name: "Periodo",
        source: "Periodo",
        need: "Obligatoria",
        description: "Cierre al que se refiere el comentario.",
        example: "2026-10-07",
        usedIn: "Bitácora"
      },
      {
        name: "NIT",
        source: "NIT",
        need: "Obligatoria",
        description: "NIT del cliente.",
        example: "8600669427",
        usedIn: "Bitácora"
      },
      {
        name: "Cliente",
        source: "CLIENT_NAME",
        need: "Opcional",
        description: "Razón social (solo referencia).",
        example: "CAJA DE COMPENSACION CENTRAL",
        usedIn: "Bitácora"
      },
      {
        name: "Comentario",
        source: "COMENTARIO",
        need: "Obligatoria",
        description: "Explicación para el comité.",
        example: "$80 MM en refacturación; gestión de cobro por $20 MM.",
        usedIn: "Bitácora y ficha del cliente"
      }
    ]
  }
};

/** Columnas del ERP que llegan en el Excel de hoy y el tablero no usa. */
const IGNORED_COLUMNS = [
  "DeDPP1",
  "Asignación",
  "Ve",
  "Referencia",
  "Lib.mayor",
  "CT",
  "Cliente (código ERP)",
  "Soc.",
  "Cond.pago",
  "IO",
  "Div.",
  "CeBe",
  "Clase",
  "Ej./mes",
  "Compens.",
  "Fe/contab/",
  "Texto",
  "Doc.comp.",
  "c",
  "Tipo NC"
];

const NEED_STYLE: Record<Need, string> = {
  Obligatoria: "bg-cp-ink text-white",
  Recomendada: "bg-cp-lime text-[#141414]",
  Opcional: "bg-cp-muted text-cp-ink-2"
};

export default function TemplateTab({ closings }: { closings: IClosingInfo[] }) {
  const [sheet, setSheet] = useState<keyof typeof SHEETS>("Cartera");
  const { help, columns } = SHEETS[sheet];

  return (
    <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
      <ChartCard
        title="Plantilla de cierre"
        help="Borrador de la plantilla única que enviaría cada proyecto. Se itera sobre esta maqueta antes de construir la carga."
        actions={
          <Segmented
            value={sheet}
            onChange={(v) => setSheet(v)}
            options={Object.keys(SHEETS).map((s) => ({ value: s, label: `Hoja ${s}` }))}
          />
        }
      >
        <p className="mb-3 text-[13px] leading-[1.55] text-cp-ink-3">{help}</p>
        <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] text-cp-ink">
          <colgroup>
            <col style={{ width: "19%" }} />
            <col style={{ width: 118 }} />
            <col />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
          </colgroup>
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-cp-line [&>th]:py-3 [&>th]:text-left [&>th]:text-[13.5px] [&>th]:font-semibold">
              <th>Columna</th>
              <th>Necesidad</th>
              <th className="px-3">Qué lleva</th>
              <th className="px-3">Ejemplo</th>
              <th>Se usa en</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((c) => (
              <tr
                key={c.name}
                className="align-top [&>td]:border-b [&>td]:border-[#f2f2f2] [&>td]:py-2.5"
              >
                <td>
                  <span className="block font-semibold">{c.name}</span>
                  {c.source !== c.name && (
                    <span className="block truncate text-cp-ink-3" title={c.source}>
                      Hoy: {c.source}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={cn("rounded-[5px] px-1.5 py-px font-medium", NEED_STYLE[c.need])}
                  >
                    {c.need}
                  </span>
                </td>
                <td className="px-3 leading-[1.5] text-cp-ink-2">{c.description}</td>
                <td className="truncate px-3 font-mono text-cp-ink-2" title={c.example}>
                  {c.example}
                </td>
                <td className="text-cp-ink-3">{c.usedIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sheet === "Cartera" && (
          <div className="mt-4 rounded-xl bg-cp-bg px-4 py-3">
            <p className="text-[13px] font-semibold text-cp-ink">
              Columnas del ERP que llegan hoy y el tablero no usa
            </p>
            <p className="mt-0.5 text-[13px] text-cp-ink-3">
              Se pueden dejar en el archivo; la carga las ignora.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {IGNORED_COLUMNS.map((c) => (
                <span
                  key={c}
                  className="rounded-[5px] bg-cp-surface px-1.5 py-px text-[13px] text-cp-ink-3"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Cierres cargados"
        help="Cada cierre queda fijo una vez publicado: lo que se ve aquí no cambia aunque luego se apliquen pagos en Cashport."
      >
        <div className="flex flex-col">
          {closings.map((c) => (
            <div key={c.period} className="flex items-start gap-3 border-b border-[#f2f2f2] py-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cp-lime-dark" />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-cp-ink">{periodLabel(c.period)}</p>
                <p className="truncate text-[13px] text-cp-ink-3">
                  Corte {formatDate(c.cutoffDate)} · {c.rows.toLocaleString("es-CO")} documentos
                </p>
                <p className="truncate text-[13px] text-cp-ink-3">
                  {c.fileName} · {c.loadedBy} · {formatDate(c.loadedAt)}
                </p>
              </div>
              <span className="rounded-[5px] bg-cp-lime px-1.5 py-px text-[13px] font-semibold text-[#141414]">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
