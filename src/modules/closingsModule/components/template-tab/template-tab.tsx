"use client";

import { useState } from "react";
import { Popconfirm } from "antd";
import { FileXls } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";
import { deleteClosing, downloadClosingTemplate } from "@/services/closings/closings";
import type { IClosingInfo } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import useIsMobile from "../../hooks/use-is-mobile";
import { formatAmount, formatDate, periodLabel } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";

type Need = "Obligatoria" | "Opcional";

interface TemplateColumn {
  name: string;
  need: Need;
  description: string;
  example: string;
}

/* Plantilla única de cierre. Los encabezados deben ir en este orden en la primera fila de
   cada hoja; la carga rechaza el archivo si no coinciden. */
const SHEETS: Record<"Cartera" | "Pagos", { help: string; columns: TemplateColumn[] }> = {
  Cartera: {
    help: "Un renglón por documento abierto al cierre, tal como sale del ERP. Las primeras columnas vienen del ERP; desde Tipo son las clasificaciones del equipo. Todas las columnas van en el archivo; las opcionales pueden ir vacías.",
    columns: [
      {
        name: "Periodo",
        need: "Obligatoria",
        description:
          "Mes del cierre (cualquier día del mes). Debe ser el mismo mes que eliges al cargar.",
        example: "2026-09-01"
      },
      {
        name: "NIT",
        need: "Obligatoria",
        description:
          "NIT del cliente. Debe existir en Clientes del proyecto: de ahí salen ejecutivo, mercado, KAM, KAM líder, coordinador y holding.",
        example: "8909006089"
      },
      {
        name: "Shipto",
        need: "Opcional",
        description: "Punto de entrega. Se guarda para análisis futuros.",
        example: "1200002201"
      },
      {
        name: "Cond.pago",
        need: "Opcional",
        description:
          "Condición de pago al momento del cierre (queda en la foto aunque luego cambie).",
        example: "OF45"
      },
      {
        name: "Tipo documento",
        need: "Obligatoria",
        description: "Clase de documento literal del ERP (RG, AB, QA…).",
        example: "RG"
      },
      {
        name: "Documento",
        need: "Obligatoria",
        description: "Número del documento.",
        example: "1227670046"
      },
      {
        name: "Fecha documento",
        need: "Obligatoria",
        description: "Fecha de emisión.",
        example: "2026-09-17"
      },
      {
        name: "Fecha vencimiento",
        need: "Opcional",
        description: "Vencimiento neto del documento.",
        example: "2026-11-01"
      },
      {
        name: "Monto",
        need: "Obligatoria",
        description: "Saldo abierto. Negativo para notas y pagos.",
        example: "517007260"
      },
      {
        name: "Descripcion",
        need: "Opcional",
        description: "Texto del documento en el ERP.",
        example: "FRA. CCIAL - 00EX243732"
      },
      {
        name: "Tipo",
        need: "Obligatoria",
        description: "Tipo traducido: Factura, NC, ND, Saldos, Pago o Pendiente.",
        example: "Factura"
      },
      {
        name: "Segmento",
        need: "Opcional",
        description: "Causal de la nota: Negociaciones, Devolución, Averia…",
        example: "Facturacion"
      },
      {
        name: "Descripcion",
        need: "Opcional",
        description: "Descripción del segmento (segunda columna con este nombre).",
        example: "FT Crédito formal"
      },
      {
        name: "Tipo saldo",
        need: "Opcional",
        description: "Causal del saldo abierto. Solo se llena cuando Tipo = Saldos.",
        example: "Por clasificar"
      },
      {
        name: "Vencimiento",
        need: "Obligatoria",
        description:
          "Tramo al corte: Corriente, 0-30, 31-60, 61-90, 91-120 o +120. Vacío cuenta como corriente.",
        example: "Corriente"
      },
      {
        name: "Relacion documento",
        need: "Opcional",
        description: "Documento relacionado (la nota de una factura o la factura de una nota).",
        example: "FVVC2111232"
      },
      {
        name: "Llave",
        need: "Opcional",
        description:
          "Llave libre para rastrear un registro entre cierres cuando documento y monto se repiten.",
        example: "CO01996743"
      }
    ]
  },
  Pagos: {
    help: "Recaudo del mes del cierre con el estado en que lo dejó la compañía al corte. Explica la diferencia con lo aplicado en Cashport.",
    columns: [
      {
        name: "Periodo",
        need: "Obligatoria",
        description: "Mes del cierre (el mismo de la hoja Cartera).",
        example: "2026-09-01"
      },
      {
        name: "Estado",
        need: "Obligatoria",
        description: "Estado al cierre: Compensado o Pendiente compensacion.",
        example: "Compensado"
      },
      {
        name: "NIT",
        need: "Obligatoria",
        description: "NIT del cliente (debe existir en Clientes).",
        example: "9004805691"
      },
      { name: "Shipto", need: "Opcional", description: "Punto de entrega.", example: "1210611598" },
      {
        name: "Fecha compensacion",
        need: "Opcional",
        description: "Fecha en que la compañía compensó el pago.",
        example: "2026-09-23"
      },
      {
        name: "Fecha pago",
        need: "Opcional",
        description: "Fecha en que entró el pago.",
        example: "2026-09-22"
      },
      {
        name: "Monto",
        need: "Obligatoria",
        description: "Valor del pago.",
        example: "13409807814"
      },
      {
        name: "ID_ERP",
        need: "Opcional",
        description: "Documento del pago en el ERP.",
        example: "700151237"
      }
    ]
  }
};

const NEED_STYLE: Record<Need, string> = {
  Obligatoria: "bg-cp-ink text-white",
  Opcional: "bg-cp-muted text-cp-ink-2"
};

const STATUS_LABEL: Record<IClosingInfo["status"], string> = {
  READY: "Publicado",
  PROCESSING: "Procesando",
  FAILED: "Falló"
};

interface Props {
  closings: IClosingInfo[];
  onDeleted: () => void;
}

export default function TemplateTab({ closings, onDeleted }: Props) {
  const { showMessage } = useMessageApi();
  const [sheet, setSheet] = useState<keyof typeof SHEETS>("Cartera");
  const isMobile = useIsMobile();
  const { help, columns } = SHEETS[sheet];

  const remove = async (closing: IClosingInfo) => {
    try {
      await deleteClosing(closing.id);
      showMessage(
        "success",
        `Se eliminó el cierre de ${periodLabel(closing.period).toLowerCase()}`
      );
      onDeleted();
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo eliminar el cierre");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
      <ChartCard
        title="Plantilla de cierre"
        help="La plantilla que carga cada proyecto. Los encabezados deben ir exactamente en este orden en la primera fila de cada hoja."
        actions={
          <>
            <Segmented
              value={sheet}
              onChange={(v) => setSheet(v)}
              options={(Object.keys(SHEETS) as (keyof typeof SHEETS)[]).map((s) => ({
                value: s,
                label: `Hoja ${s}`
              }))}
            />
            <button
              type="button"
              onClick={() =>
                downloadClosingTemplate().catch(() =>
                  showMessage("error", "No se pudo descargar la plantilla")
                )
              }
              className="cp-control-fill flex h-[var(--control-h)] items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-cp-ink"
            >
              <FileXls size={18} /> Descargar
            </button>
          </>
        }
      >
        <p className="mb-3 text-[13px] leading-[1.55] text-cp-ink-3">{help}</p>
        <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] text-cp-ink">
          <colgroup>
            <col style={{ width: isMobile ? "38%" : "19%" }} />
            {!isMobile && <col style={{ width: 112 }} />}
            <col />
            {!isMobile && <col style={{ width: "20%" }} />}
          </colgroup>
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-cp-line [&>th]:py-3 [&>th]:text-left [&>th]:text-[13.5px] [&>th]:font-semibold">
              <th>Columna</th>
              {!isMobile && <th>Llenado</th>}
              <th className="px-3">Qué lleva</th>
              {!isMobile && <th className="px-3">Ejemplo</th>}
            </tr>
          </thead>
          <tbody>
            {columns.map((c, i) => (
              <tr
                key={`${c.name}-${i}`}
                className="align-top [&>td]:border-b [&>td]:border-cp-line [&>td]:py-2.5"
              >
                <td className="font-semibold">
                  <span className="mr-1.5 text-cp-ink-4">{i + 1}.</span>
                  {c.name}
                  {isMobile && (
                    <span
                      className={cn(
                        "mt-1 block w-fit rounded-[5px] px-1.5 py-px font-medium",
                        NEED_STYLE[c.need]
                      )}
                    >
                      {c.need}
                    </span>
                  )}
                </td>
                {!isMobile && (
                  <td>
                    <span
                      className={cn("rounded-[5px] px-1.5 py-px font-medium", NEED_STYLE[c.need])}
                    >
                      {c.need}
                    </span>
                  </td>
                )}
                <td className="px-3 leading-[1.5] text-cp-ink-2">{c.description}</td>
                {!isMobile && (
                  <td className="truncate px-3 font-mono text-cp-ink-2" title={c.example}>
                    {c.example}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>

      <ChartCard
        title="Cierres cargados"
        help="Cada cierre queda fijo una vez publicado. Para corregir un mes, elimínalo y vuelve a cargarlo; los comentarios del mes se conservan."
      >
        <div className="flex flex-col">
          {closings.length === 0 && (
            <p className="py-6 text-[13px] text-cp-ink-3">Todavía no hay cierres cargados.</p>
          )}
          {closings.map((c) => (
            <div key={c.id} className="flex items-start gap-3 border-b border-cp-line py-3">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  c.status === "READY" ? "bg-cp-lime-dark" : "bg-[#f5b700]"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-cp-ink">{periodLabel(c.period)}</p>
                <p className="truncate text-[13px] text-cp-ink-3">
                  {c.document_rows.toLocaleString("es-CO")} documentos ·{" "}
                  {formatAmount(c.portfolio_amount)}
                </p>
                <p className="truncate text-[13px] text-cp-ink-3" title={c.file_name ?? undefined}>
                  {c.file_name ?? "—"} · {c.created_by_email ?? "—"} · {formatDate(c.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "rounded-[5px] px-1.5 py-px text-[13px] font-semibold",
                    c.status === "READY" ? "bg-cp-lime text-[#141414]" : "bg-cp-muted text-cp-ink-2"
                  )}
                >
                  {STATUS_LABEL[c.status]}
                </span>
                {c.status === "READY" && (
                  <Popconfirm
                    title={`¿Eliminar el cierre de ${periodLabel(c.period).toLowerCase()}?`}
                    description="Se borra la foto cargada para poder subirla de nuevo."
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(c)}
                  >
                    <button
                      type="button"
                      className="text-[13px] font-semibold text-[#d11a2a] dark:text-[#ff6b6b] hover:underline"
                    >
                      Eliminar
                    </button>
                  </Popconfirm>
                )}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
