"use client";

import { useMemo } from "react";
import { Pagination } from "antd";
import { Eye } from "lucide-react";

import { cn } from "@/utils/utils";
import { DOCUMENT_TYPE_LABEL } from "../../constants";
import { fac, fmtD, fmtFull, fmtM } from "../../utils/format";
import SortableTh from "../shared/sortable-th";
import StatusChip from "../shared/status-chip";
import type { IWalletDocument, SortState } from "../../types";

export interface GroupInvoicesPagination {
  page: number;
  pageSize: number;
  /** Documentos del grupo entero, no sólo de la página cargada. */
  total: number;
  onChange: (page: number) => void;
}

interface GroupInvoicesTableProps {
  /** Página cargada del grupo, ya ordenada por el servidor. */
  documentos: IWalletDocument[];
  query: string;
  /**
   * Se guardan documentos y no ids: con paginación del servidor, los marcados
   * en otra página ya no están en `documentos` y aun así hay que poder
   * mostrarlos, sumarlos y mandarlos a crear/vincular novedad.
   */
  selected: IWalletDocument[];
  onSelectedChange: (docs: IWalletDocument[]) => void;
  /** Orden del servidor sobre el grupo completo; lo posee el modal. `col` es el `sort_by` del API. */
  sort: SortState;
  onSort: (col: string) => void;
  /** Paginación del servidor: la tabla sólo tiene la página cargada. */
  pagination?: GroupInvoicesPagination;
}

// bg-muted opaco (no /40): la cabecera es sticky y las filas pasan por debajo.
const TH =
  "border-b border-border bg-muted px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

/** Lo mismo para los encabezados ordenables, que traen su propio bg-muted/40. */
const SORTABLE_TH = "bg-muted";

/** Documentos del grupo, con selección y totales de lo que se está viendo. */
export default function GroupInvoicesTable({
  documentos,
  query,
  selected,
  onSelectedChange,
  sort,
  onSort,
  pagination
}: GroupInvoicesTableProps) {
  // Sin reordenar: la tabla sólo tiene la página cargada, y ordenarla aquí
  // contradiría el orden del servidor sobre el grupo completo.
  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? documentos.filter((d) => d.doc.toLowerCase().includes(q)) : documentos;
  }, [documentos, query]);

  const sumaVista = visibles.reduce((a, d) => a + d.saldo, 0);
  const recuperadoVista = visibles.reduce((a, d) => a + (d.saldoInicial - d.saldo), 0);
  const montoSel = selected.reduce((a, d) => a + d.saldo, 0);

  const selectedIds = useMemo(() => new Set(selected.map((d) => d.id)), [selected]);
  const isSelected = (d: IWalletDocument) => selectedIds.has(d.id);

  const todasVisiblesSel = visibles.length > 0 && visibles.every(isSelected);

  const toggle = (doc: IWalletDocument) =>
    onSelectedChange(
      isSelected(doc) ? selected.filter((d) => d.id !== doc.id) : [...selected, doc]
    );

  // "Seleccionar todo" actúa sólo sobre lo visible: desmarcarlo no suelta lo
  // marcado en otras páginas.
  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedChange([...selected, ...visibles.filter((d) => !isSelected(d))]);
      return;
    }
    const visibleIds = new Set(visibles.map((d) => d.id));
    onSelectedChange(selected.filter((d) => !visibleIds.has(d.id)));
  };

  // Con paginación el "de N" es el total del grupo; sin ella, lo que se ocultó
  // por búsqueda.
  const totalConocido = pagination?.total ?? documentos.length;

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-[1]">
            <tr>
              <th scope="col" className={cn(TH, "w-[38px]")}>
                <input
                  type="checkbox"
                  aria-label="Seleccionar todo"
                  className="accent-wallet-accent"
                  checked={todasVisiblesSel}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              {/* Los `col` son los `sort_by` del API, así el modal los manda tal cual. */}
              <SortableTh
                col="document"
                label="Factura"
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <SortableTh
                col="document_date"
                label="Fecha doc."
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <SortableTh
                col="type"
                label="Tipo"
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <SortableTh
                col="status"
                label="Estado"
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <SortableTh
                col="initial_amount"
                label="Saldo inicial"
                align="right"
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <SortableTh
                col="amount"
                label="Saldo actual"
                align="right"
                sort={sort}
                onSort={onSort}
                className={SORTABLE_TH}
              />
              <th className={cn(TH, "w-10")} />
            </tr>
          </thead>

          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-9 text-center text-muted-foreground">
                  {documentos.length === 0
                    ? "No hay facturas para mostrar."
                    : "Ninguna factura coincide con la búsqueda."}
                </td>
              </tr>
            ) : (
              visibles.map((d) => (
                <tr
                  key={d.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    isSelected(d) && "bg-wallet-accent/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${d.doc}`}
                      className="accent-wallet-accent"
                      checked={isSelected(d)}
                      onChange={() => toggle(d)}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-foreground">{d.doc}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                    {d.fechaDoc ? fmtD(d.fechaDoc) : "—"}
                  </td>
                  <td className="px-3 py-2.5">{DOCUMENT_TYPE_LABEL[d.tipo]}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <StatusChip>{d.estado}</StatusChip>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                    {fmtFull(d.saldoInicial)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-foreground">
                    {fmtFull(d.saldo)}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      title="Ver detalle de la factura (próximamente)"
                      aria-label="Ver detalle de la factura"
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-border">
              <th colSpan={5} className="px-3 py-2.5 text-left font-semibold text-foreground">
                Total{query.trim() ? " filtrado" : ""}
              </th>
              <th
                colSpan={2}
                className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground"
              >
                {fmtFull(sumaVista)}
              </th>
              <th />
            </tr>
            <tr>
              <th
                colSpan={5}
                className="px-3 pb-2.5 text-left text-[11.5px] font-medium text-muted-foreground"
              >
                {fac(visibles.length)}
                {visibles.length !== totalConocido ? ` de ${totalConocido}` : ""}
              </th>
              <th
                colSpan={2}
                className="whitespace-nowrap px-3 pb-2.5 text-right text-[11.5px] font-medium tabular-nums text-muted-foreground"
              >
                Recuperado {fmtFull(recuperadoVista)}
              </th>
              <th />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-none items-center gap-3 border-t border-border px-5 py-3.5 text-[12.5px] text-muted-foreground">
        {pagination && pagination.total > pagination.pageSize && (
          <Pagination
            size="small"
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={false}
            onChange={pagination.onChange}
          />
        )}

        <span className="ml-auto">
          {selected.length ? (
            <>
              <b className="font-semibold tabular-nums text-foreground">{selected.length}</b>
              &nbsp;{selected.length === 1 ? "factura seleccionada" : "facturas seleccionadas"}{" "}
              ·&nbsp;
              <b className="font-semibold tabular-nums text-foreground">{fmtM(montoSel)}</b>
            </>
          ) : (
            "Sin facturas seleccionadas"
          )}
        </span>
      </div>
    </>
  );
}
