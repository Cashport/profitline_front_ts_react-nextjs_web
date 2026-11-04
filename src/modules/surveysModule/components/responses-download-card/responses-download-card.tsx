"use client";

import { useState } from "react";
import { ConfigProvider, Select } from "antd";
import { Download } from "lucide-react";
import { useTranslations } from "use-intl";

import { MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import type { IVisitFormResponsesExportParams } from "@/types/surveys/ISurveys";
import { cn } from "@/utils/utils";

import { EXPORT_PERIODS } from "../../constants";
import { useVisitFormResponsesExport } from "../../hooks/useVisitFormResponsesExport";
import ActionButton from "../shared/action-button";

type ExportFormat = IVisitFormResponsesExportParams["format"];

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" }
];

/**
 * "Descargar respuestas": una fila por respuesta y una columna por pregunta, del periodo elegido.
 * Va en la fila de KPIs con su mismo alto (docs/DESIGN.md §5): título arriba y, abajo, los
 * controles en una sola línea con la descarga a la derecha.
 */
export default function ResponsesDownloadCard({
  formId,
  className
}: {
  formId: number;
  className?: string;
}) {
  const t = useTranslations("surveys.download");
  const tPeriods = useTranslations("surveys.exportPeriods");
  const { download, isDownloading } = useVisitFormResponsesExport(formId);
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [periodId, setPeriodId] = useState("mes");
  const [includeLinks, setIncludeLinks] = useState(true);

  const handleDownload = () => {
    const period = EXPORT_PERIODS.find((p) => p.id === periodId) ?? EXPORT_PERIODS[0];
    download({ format, ...period.resolve(), include_links: includeLinks });
  };

  return (
    <section
      className={cn("cp-card flex flex-col justify-between gap-3 px-[18px] py-[14px]", className)}
    >
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <Download className="h-4 w-4 shrink-0 text-cp-ink" />
        <h2 className="shrink-0 font-semibold text-cp-ink">{t("title")}</h2>
        <span className="truncate text-muted-foreground">· {t("subtitle")}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* Selector segmentado gris con la opción activa en blanco, como el de Tema del avatar. */}
        <div
          role="radiogroup"
          aria-label={t("format")}
          className="flex h-[var(--control-h)] shrink-0 rounded-lg bg-cp-bg p-[3px]"
        >
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={format === f.value}
              onClick={() => setFormat(f.value)}
              className={cn(
                "cursor-pointer rounded-md border-0 px-3.5 text-[13px] transition-colors",
                format === f.value
                  ? "bg-cp-surface font-semibold text-cp-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                  : "bg-transparent font-medium text-cp-ink-3 hover:text-cp-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* El tema raíz usa controles de 47px: aquí van al alto de los demás (--control-h). */}
        <ConfigProvider theme={{ components: { Select: { controlHeight: 36, borderRadius: 8 } } }}>
          <Select
            aria-label={t("period")}
            variant="filled"
            value={periodId}
            onChange={setPeriodId}
            options={EXPORT_PERIODS.map((p) => ({ value: p.id, label: tPeriods(p.id) }))}
            className="w-[170px] shrink-0"
          />
        </ConfigProvider>

        <span className="text-[13px] text-cp-ink-2">
          <MiniSwitch
            checked={includeLinks}
            onChange={setIncludeLinks}
            label={t("includeLinksShort")}
            title={t("includeLinks")}
          />
        </span>

        <ActionButton
          variant="primary"
          icon={<Download />}
          loading={isDownloading}
          onClick={handleDownload}
          className="ml-auto"
        >
          {t("download", { format: format === "csv" ? "CSV" : "Excel" })}
        </ActionButton>
      </div>
    </section>
  );
}
