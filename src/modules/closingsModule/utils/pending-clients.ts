/** Descarga los NIT pendientes por crear como CSV (separador ";" y BOM para que Excel lo abra bien). */
export function downloadPendingClients(
  rows: { nit: string; documents?: number; rows?: number; amount: number; payments?: number }[],
  period: string
) {
  const header = ["NIT", "Documentos", "Cartera", "Pagos"];
  const lines = rows.map((r) =>
    [r.nit, r.documents ?? r.rows ?? 0, Math.round(r.amount), r.payments ?? 0].join(";")
  );
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `nit-pendientes-por-crear-${period}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
