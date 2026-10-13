// Return dates come as "YYYY-MM-DD HH:mm" and are reformatted to DD/MM/YYYY.
export function parseFechaReturn(fecha: string): { date: string; time: string } {
  const [datePart, timePart] = fecha.split(" ");
  const [yyyy, mm, dd] = datePart.split("-");
  return { date: `${dd}/${mm}/${yyyy}`, time: timePart ?? "" };
}

// Approval dates already come as "DD/MM/YYYY HH:mm" — just split date/time.
export function parseFechaApproval(fecha: string): { date: string; time: string } {
  const [datePart, timePart] = fecha.split(" ");
  return { date: datePart, time: timePart ?? "" };
}

export const fmtNumber = (n: number) => n.toLocaleString("es-CO");

export const fmtCop = (n: number) => "$" + n.toLocaleString("es-CO");

export const fmtPct = (n: number) =>
  (n * 100).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
