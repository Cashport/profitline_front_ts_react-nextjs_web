import type { IReport } from "@/types/reports/IReports";

import { fmtReportDate } from "../utils/reports-format";

/*
 * HTML de ejemplo para el detalle mientras el backend no envía el de cada
 * informe. Es un documento completo con sus propios estilos, como el que
 * llegará: el visor lo pinta tal cual.
 */

const MONTHS = ["Abr", "May", "Jun", "Jul", "Ago", "Sep"];
const CLIENTS = [
  "Droguería La Salud",
  "Supermercado El Ahorro",
  "Tienda Don Pepe",
  "Minimercado La 80",
  "Farmacia Central",
  "Autoservicio Los Andes"
];

const STYLES = `
body{margin:0;font-family:Georgia,'Times New Roman',serif;color:#1d2b27;background:#fbfaf7}
.wrap{max-width:980px;margin:0 auto;padding:40px 32px 64px}
.eyebrow{font:600 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#0e7c66}
h1{font-size:34px;font-weight:400;margin:10px 0 6px}
.sub{font:14px/1.5 system-ui,sans-serif;color:#5b6b66;margin:0 0 28px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.k{background:#fff;border:1px solid #e6e2d8;border-radius:10px;padding:16px 18px}
.k span{font:12px system-ui,sans-serif;color:#5b6b66}.k b{display:block;font-size:26px;font-weight:400;margin-top:6px}
section{background:#fff;border:1px solid #e6e2d8;border-radius:10px;padding:20px 22px;margin-bottom:18px}
h2{font-size:18px;font-weight:400;margin:0 0 14px}
table{width:100%;border-collapse:collapse;font:13px system-ui,sans-serif}
th{text-align:left;font-weight:600;color:#5b6b66;border-bottom:1px solid #e6e2d8;padding:8px 10px}
td{padding:9px 10px;border-bottom:1px solid #f1eee6}.n{text-align:right;font-variant-numeric:tabular-nums}
tfoot td{font-weight:700;border-top:2px solid #1d2b27;border-bottom:0}
.note{font:13px/1.6 system-ui,sans-serif;color:#3a4a45}`;

const money = (n: number) => `$ ${Math.round(n).toLocaleString("es-CO")}`;
const pct = (part: number, total: number) => `${((100 * part) / total).toFixed(0)}%`;

/** Aleatorio con semilla: el mismo informe genera siempre las mismas cifras. */
const seeded = (text: string) => {
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const barsSvg = (values: number[]) => {
  const max = Math.max(...values);
  const bars = values
    .map((v, i) => {
      const h = (v / max) * 150;
      const x = 20 + i * 70;
      const fill = i === values.length - 1 ? "#0e7c66" : "#9fb8b0";
      return `<rect x="${x}" y="${170 - h}" width="38" height="${h}" rx="4" fill="${fill}"/><text x="${x + 19}" y="190" text-anchor="middle" font-size="11" fill="#5b6b66">${MONTHS[i]}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 440 200" width="100%" style="max-width:640px;display:block">${bars}<line x1="10" x2="430" y1="170" y2="170" stroke="#e6e2d8"/></svg>`;
};

export function sampleReportHtml(report: IReport): string {
  const rnd = seeded(report.name);
  const isCollection = /recaudo/i.test(report.report_type_name);
  const rows = CLIENTS.map((name) => {
    const billed = 4e6 + rnd() * 40e6;
    return { name, billed, paid: billed * (0.55 + rnd() * 0.45) };
  });
  const total = rows.reduce((acc, r) => acc + r.billed, 0);
  const totalPaid = rows.reduce((acc, r) => acc + r.paid, 0);

  const tableRows = rows
    .map(
      (r) =>
        `<tr><td>${r.name}</td><td class="n">${money(r.billed)}</td><td class="n">${money(r.paid)}</td><td class="n">${pct(r.paid, r.billed)}</td></tr>`
    )
    .join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}</style></head>
<body><div class="wrap">
<div class="eyebrow">${report.report_type_name}</div>
<h1>${report.name}</h1>
<p class="sub">Corte al ${fmtReportDate(report.published_at)}. Documento generado a partir de la información de cartera y recaudo.</p>
<div class="kpis">
<div class="k"><span>${isCollection ? "Recaudo del periodo" : "Cartera total"}</span><b>${money(total)}</b></div>
<div class="k"><span>${isCollection ? "Pendiente por recaudar" : "Cartera vencida"}</span><b>${money(total - totalPaid)}</b></div>
<div class="k"><span>Clientes gestionados</span><b>${120 + Math.floor(rnd() * 90)}</b></div>
</div>
<section><h2>Evolución ${isCollection ? "del recaudo" : "de la cartera"} (millones)</h2>${barsSvg(MONTHS.map(() => 380 + rnd() * 320))}</section>
<section><h2>Detalle por cliente</h2><table>
<thead><tr><th>Cliente</th><th class="n">Facturado</th><th class="n">${isCollection ? "Recaudado" : "Al día"}</th><th class="n">%</th></tr></thead>
<tbody>${tableRows}</tbody>
<tfoot><tr><td>Total</td><td class="n">${money(total)}</td><td class="n">${money(totalPaid)}</td><td class="n">${pct(totalPaid, total)}</td></tr></tfoot>
</table></section>
<section><h2>Conclusiones</h2><p class="note">El periodo cierra con un comportamiento estable. Se recomienda priorizar la gestión de los clientes con saldo superior a 60 días y reforzar el seguimiento a los acuerdos de pago vigentes.</p></section>
</div></body></html>`;
}
