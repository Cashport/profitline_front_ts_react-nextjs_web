"use client";

import { DOCUMENT_TYPE_LABEL } from "../../constants";
import { fmtFull } from "../../utils/format";
import type { IWalletDocument } from "../../types";

interface NoveltyDocumentsTableProps {
  /** Facturas y saldos marcados en la pestaña "Facturas". */
  documentos: IWalletDocument[];
}

const TH =
  "border-b border-border bg-muted px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

/**
 * Tabla "Facturas incluidas" de los paneles de novedad: los documentos
 * seleccionados y su total. Sin vencimiento ni tramo: incident-detail no los manda.
 */
export default function NoveltyDocumentsTable({ documentos }: NoveltyDocumentsTableProps) {
  const total = documentos.reduce((sum, d) => sum + d.saldo, 0);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th scope="col" className={TH}>
              Factura
            </th>
            <th scope="col" className={TH}>
              Tipo
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Saldo
            </th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((d) => (
            <tr key={d.id} className="border-b border-border">
              <td className="px-3 py-2 font-mono font-semibold text-foreground">{d.doc}</td>
              <td className="px-3 py-2">{DOCUMENT_TYPE_LABEL[d.tipo]}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground">
                {fmtFull(d.saldo)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2} className="px-3 py-2 text-left font-semibold text-foreground">
              Total
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-foreground">
              {fmtFull(total)}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
