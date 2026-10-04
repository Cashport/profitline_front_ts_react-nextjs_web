import { formatNumber } from "@/utils/utils";
import { MOCK_PAID_STATUS } from "./bulk-search-mock-data";
import { BulkPaymentOrder, IBulkPaymentCoverage, IBulkSearchRow } from "./types";

export const MAX_BULK_IDS = 30000;

// IDs separados por saltos de línea, espacios, comas o punto y coma (p. ej. pegados desde Excel)
export const parseIds = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((id) => id.toUpperCase())
    .filter(Boolean);

// 892687900000 → "$ 892.687,9 M"
export const formatMillions = (value: number) => {
  const [integer, decimal] = (value / 1e6).toFixed(1).split(".");
  return `$ ${formatNumber(integer)}${decimal === "0" ? "" : `,${decimal}`} M`;
};

// CSV separado por ";" y con BOM para que Excel respete columnas y tildes
export const downloadCsv = (fileName: string, header: string[], rows: (string | number)[][]) => {
  const escapeCell = (value: string | number) => {
    const text = String(value);
    return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = `﻿${[header, ...rows].map((row) => row.map(escapeCell).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Cuántas facturas pendientes cubre el pago, aplicándolo en el orden elegido
export const computePaymentCoverage = (
  rows: IBulkSearchRow[],
  payment: number,
  order: BulkPaymentOrder
): IBulkPaymentCoverage => {
  const pendingRows = rows.filter((row) => row.status !== MOCK_PAID_STATUS);
  const sorted = [...pendingRows].sort((a, b) =>
    order === "antiguedad" ? (b.dueDays ?? 0) - (a.dueDays ?? 0) : (a.amount ?? 0) - (b.amount ?? 0)
  );

  let left = payment;
  let covered = 0;
  let partial = false;
  for (const row of sorted) {
    if (left <= 0) break;
    const amount = row.amount ?? 0;
    if (amount <= left) {
      left -= amount;
      covered++;
    } else {
      partial = true;
      left = 0;
    }
  }

  return {
    covered,
    partial,
    left,
    total: pendingRows.reduce((acc, row) => acc + (row.amount ?? 0), 0),
    pending: pendingRows.length,
    payment
  };
};
