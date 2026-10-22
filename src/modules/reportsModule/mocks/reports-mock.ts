import type { GenericResponse } from "@/types/global/IGlobal";
import type {
  IPublishReportPayload,
  IReport,
  IReportDetail,
  IReportType
} from "@/types/reports/IReports";

import { sampleReportHtml } from "./sample-report-html";

/*
 * Backend simulado de Informes. Responde con la misma forma que los endpoints
 * (GenericResponse) para que los hooks no cambien al conectarlos. Vive en
 * memoria: lo publicado dura hasta recargar la página.
 */

type StoredReport = IReport & { html?: string };

const LATENCY_MS = 350;

const reportTypes: IReportType[] = [
  { id: 1, name: "Informe de cierre" },
  { id: 2, name: "Informe de recaudo" },
  { id: 3, name: "Informe de cartera" }
];

/** Los de ejemplo no traen `html`: el detalle lo genera con sampleReportHtml. */
let reports: StoredReport[] = [
  {
    id: 1,
    name: "Informe cierre mayo",
    report_type_id: 1,
    report_type_name: "Informe de cierre",
    published_at: "2026-06-03"
  },
  {
    id: 2,
    name: "Informe cierre junio",
    report_type_id: 1,
    report_type_name: "Informe de cierre",
    published_at: "2026-07-02"
  },
  {
    id: 3,
    name: "Informe de recaudo septiembre",
    report_type_id: 2,
    report_type_name: "Informe de recaudo",
    published_at: "2026-10-04"
  },
  {
    id: 4,
    name: "Informe cierre septiembre",
    report_type_id: 1,
    report_type_name: "Informe de cierre",
    published_at: "2026-10-06"
  },
  {
    id: 5,
    name: "Cartera por edades Q3",
    report_type_id: 3,
    report_type_name: "Informe de cartera",
    published_at: "2026-10-14"
  }
];

function respond<T>(data: T): Promise<GenericResponse<T>> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ status: 200, message: "OK", data }), LATENCY_MS)
  );
}

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((i) => i.id)) + 1;

const toSummary = (r: StoredReport): IReport => ({
  id: r.id,
  name: r.name,
  report_type_id: r.report_type_id,
  report_type_name: r.report_type_name,
  published_at: r.published_at
});

/** GET /reports */
export const getReportsMock = () => respond(reports.map(toSummary));

/** GET /reports/:id */
export const getReportDetailMock = async (id: number): Promise<GenericResponse<IReportDetail>> => {
  const report = reports.find((r) => r.id === id);
  if (!report) throw new Error("No se encontró el informe.");
  return respond({ ...toSummary(report), html: report.html ?? sampleReportHtml(report) });
};

/** GET /reports/types */
export const getReportTypesMock = () => respond(reportTypes.slice());

/** POST /reports */
export const publishReportMock = async ({ report_type_id, name, file }: IPublishReportPayload) => {
  const type = reportTypes.find((t) => t.id === report_type_id);
  if (!type) throw new Error("El tipo de informe no existe.");

  const report: StoredReport = {
    id: nextId(reports),
    name,
    report_type_id,
    report_type_name: type.name,
    published_at: new Date().toISOString(),
    html: await file.text()
  };
  reports = [report, ...reports];
  return respond(toSummary(report));
};
