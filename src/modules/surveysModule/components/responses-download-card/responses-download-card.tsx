"use client";

import { useState } from "react";
import { ConfigProvider, Segmented, Select, Switch } from "antd";
import { Download } from "lucide-react";

import type { IVisitFormResponsesExportParams } from "@/types/surveys/ISurveys";

import { EXPORT_PERIODS } from "../../constants";
import { useVisitFormResponsesExport } from "../../hooks/useVisitFormResponsesExport";
import ActionButton from "../shared/action-button";

type ExportFormat = IVisitFormResponsesExportParams["format"];

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" }
];

/** "Descargar respuestas": una fila por respuesta y una columna por pregunta, del periodo elegido. */
export default function ResponsesDownloadCard({ formId }: { formId: number }) {
  const { download, isDownloading } = useVisitFormResponsesExport(formId);
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [periodId, setPeriodId] = useState("mes");
  const [includeLinks, setIncludeLinks] = useState(true);

  const handleDownload = () => {
    const period = EXPORT_PERIODS.find((p) => p.id === periodId) ?? EXPORT_PERIODS[0];
    download({ format, ...period.resolve(), include_links: includeLinks });
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Download className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Descargar respuestas</h2>
          <p className="text-xs text-muted-foreground">
            Una fila por respuesta, una columna por pregunta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Formato</span>
          {/* El tema raíz fija colorTextSecondary en blanco, que oculta la opción no seleccionada */}
          <ConfigProvider
            theme={{ components: { Segmented: { itemColor: "rgba(0, 0, 0, 0.65)" } } }}
          >
            <Segmented
              block
              value={format}
              onChange={(value) => setFormat(value as ExportFormat)}
              options={FORMATS}
            />
          </ConfigProvider>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Periodo</span>
          <Select
            value={periodId}
            onChange={setPeriodId}
            options={EXPORT_PERIODS.map((p) => ({ value: p.id, label: p.label }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
          <Switch size="small" checked={includeLinks} onChange={setIncludeLinks} />
          Incluir enlaces a fotos y archivos
        </label>
        <ActionButton
          variant="primary"
          icon={<Download />}
          loading={isDownloading}
          onClick={handleDownload}
        >
          Descargar {format === "csv" ? "CSV" : "Excel"}
        </ActionButton>
      </div>
    </section>
  );
}
