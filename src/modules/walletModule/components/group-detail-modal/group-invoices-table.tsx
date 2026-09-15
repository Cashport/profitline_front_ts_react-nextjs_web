"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { cn } from "@/utils/utils";
import { fac, fmtD, fmtFull, fmtM } from "../../utils/format";
import StatusChip from "../shared/status-chip";
import type { IWalletDocument, WalletDocumentInactiveReason } from "../../types";

interface GroupInvoicesTableProps {
  documentos: IWalletDocument[];
  query: string;
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}

// bg-muted opaco (no /40): la cabecera es sticky y las filas pasan por debajo.
const TH =
  "border-b border-border bg-muted px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

const INACTIVE_REASON_LABEL: Record<WalletDocumentInactiveReason, string> = {
  PAID: "Pagada",
  MANUALLY_REMOVED: "Retirada manualmente",
  CANCELLED: "Anulada",
  OTHER: "Otro"
};

const TIPO_LABEL: Record<IWalletDocument["tipo"], string> = {
  FINANCIAL_RECORD: "Factura",
  BALANCE: "Saldo"
};

/** Documentos de la novedad, con selección y totales de lo que se está viendo. */
export default function GroupInvoicesTable({
  documentos,
  query,
  selected,
  onSelectedChange
}: GroupInvoicesTableProps) {
  // Las cerradas (pagadas, retiradas…) se ocultan por defecto: siguen en el
  // histórico pero ya no son cartera.
  const [verCerradas, setVerCerradas] = useState(false);

  const cerradas = documentos.filter((d) => !d.activa).length;

  const todas = useMemo(
    () => [...documentos].sort((a, b) => Number(b.activa) - Number(a.activa) || b.saldo - a.saldo),
    [documentos]
  );

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todas.filter(
      (d) => (verCerradas || d.activa) && (!q || d.doc.toLowerCase().includes(q))
    );
  }, [todas, query, verCerradas]);

  const sumaVista = visibles.reduce((a, d) => a + d.saldo, 0);
  const recuperadoVista = visibles.reduce((a, d) => a + (d.saldoInicial - d.saldo), 0);
  const montoSel = documentos
    .filter((d) => selected.includes(d.id))
    .reduce((a, d) => a + d.saldo, 0);

  const todasVisiblesSel = visibles.length > 0 && visibles.every((d) => selected.includes(d.id));

  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const toggleAll = (checked: boolean) =>
    onSelectedChange(checked ? [...new Set([...selected, ...visibles.map((d) => d.id)])] : []);

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
              <th scope="col" className={TH}>
                Factura
              </th>
              <th scope="col" className={TH}>
                Tipo
              </th>
              <th scope="col" className={TH}>
                Estado
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Saldo inicial
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Saldo actual
              </th>
              <th className={cn(TH, "w-10")} />
            </tr>
          </thead>

          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-9 text-center text-muted-foreground">
                  {todas.length === 0
                    ? "No hay facturas para mostrar."
                    : query.trim()
                      ? "Ninguna factura coincide con la búsqueda."
                      : "Todas las facturas de la novedad están cerradas."}
                </td>
              </tr>
            ) : (
              visibles.map((d) => (
                <tr
                  key={d.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    selected.includes(d.id) && "bg-wallet-accent/5",
                    !d.activa && "text-muted-foreground"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${d.doc}`}
                      className="accent-wallet-accent"
                      checked={selected.includes(d.id)}
                      onChange={() => toggle(d.id)}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-foreground">{d.doc}</td>
                  <td className="px-3 py-2.5">{TIPO_LABEL[d.tipo]}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {d.activa ? (
                      <StatusChip sev="ok">Activa</StatusChip>
                    ) : (
                      <StatusChip sev="idle">
                        {(d.inactivaMotivo && INACTIVE_REASON_LABEL[d.inactivaMotivo]) || "Cerrada"}
                        {d.inactivaEl && ` · ${fmtD(d.inactivaEl)}`}
                      </StatusChip>
                    )}
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
              <th colSpan={4} className="px-3 py-2.5 text-left font-semibold text-foreground">
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
                colSpan={4}
                className="px-3 pb-2.5 text-left text-[11.5px] font-medium text-muted-foreground"
              >
                {fac(visibles.length)}
                {visibles.length !== todas.length ? ` de ${todas.length}` : ""}
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
        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            className="accent-wallet-accent"
            checked={verCerradas}
            disabled={cerradas === 0}
            onChange={(e) => setVerCerradas(e.target.checked)}
          />
          Ver cerradas ({cerradas})
        </label>

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
