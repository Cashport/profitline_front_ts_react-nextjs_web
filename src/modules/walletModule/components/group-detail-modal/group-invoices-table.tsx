"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";

import { cn } from "@/utils/utils";
import { fac, fmtD, fmtFull, fmtM } from "../../utils/format";
import TramoChip from "../shared/tramo-chip";
import type { IWalletInvoice } from "../../types";

interface GroupInvoicesTableProps {
  invoices: IWalletInvoice[];
  query: string;
  loading?: boolean;
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}

// bg-muted opaco (no /40): la cabecera es sticky y las filas pasan por debajo.
const TH =
  "border-b border-border bg-muted px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

/** Facturas del grupo, con selección y totales de lo que se está viendo. */
export default function GroupInvoicesTable({
  invoices,
  query,
  loading,
  selected,
  onSelectedChange
}: GroupInvoicesTableProps) {
  const todas = useMemo(() => [...invoices].sort((a, b) => b.dias - a.dias), [invoices]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? todas.filter((f) => f.doc.toLowerCase().includes(q)) : todas;
  }, [todas, query]);

  const sumaVista = visibles.reduce((a, f) => a + f.saldo, 0);
  const vencidoVista = visibles.filter((f) => f.dias > 0).reduce((a, f) => a + f.saldo, 0);
  const montoSel = invoices.filter((f) => selected.includes(f.id)).reduce((a, f) => a + f.saldo, 0);

  const todasVisiblesSel = visibles.length > 0 && visibles.every((f) => selected.includes(f.id));

  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const toggleAll = (checked: boolean) =>
    onSelectedChange(checked ? [...new Set([...selected, ...visibles.map((f) => f.id)])] : []);

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
                  className="accent-wallet-nov"
                  checked={todasVisiblesSel}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th scope="col" className={TH}>
                Factura
              </th>
              <th scope="col" className={TH}>
                Vence
              </th>
              <th scope="col" className={TH}>
                Tramo
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Saldo
              </th>
              <th className={cn(TH, "w-10")} />
            </tr>
          </thead>

          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-9 text-center text-muted-foreground">
                  {loading ? "Cargando facturas…" : "Ninguna factura coincide con la búsqueda."}
                </td>
              </tr>
            ) : (
              visibles.map((f) => (
                <tr
                  key={f.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    selected.includes(f.id) && "bg-wallet-nov/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${f.doc}`}
                      className="accent-wallet-nov"
                      checked={selected.includes(f.id)}
                      onChange={() => toggle(f.id)}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-foreground">{f.doc}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-foreground">
                    {fmtD(f.vence)}
                  </td>
                  <td className="px-3 py-2.5">
                    <TramoChip tramo={f.tramo} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-foreground">
                    {fmtFull(f.saldo)}
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
              <th colSpan={3} className="px-3 py-2.5 text-left font-semibold text-foreground">
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
                colSpan={3}
                className="px-3 pb-2.5 text-left text-[11.5px] font-medium text-muted-foreground"
              >
                {fac(visibles.length)}
                {query.trim() ? ` de ${todas.length}` : ""}
              </th>
              <th
                colSpan={2}
                className="whitespace-nowrap px-3 pb-2.5 text-right text-[11.5px] font-medium tabular-nums text-muted-foreground"
              >
                Vencido {fmtFull(vencidoVista)}
              </th>
              <th />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-none items-center justify-end border-t border-border px-5 py-3.5 text-[12.5px] text-muted-foreground">
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
      </div>
    </>
  );
}
