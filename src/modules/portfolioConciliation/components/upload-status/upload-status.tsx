"use client";

import { Button, Spin } from "antd";
import { WarningCircle } from "phosphor-react";
import { useTranslations } from "use-intl";

import { formatNumber } from "@/utils/utils";
import { IConciliationUpload } from "@/types/portfolioConciliation/IPortfolioConciliation";

/** La carga sigue en el servidor: lectura del Excel, cruce y reemplazo. */
export const UploadProcessingBanner = ({ fileName }: { fileName?: string }) => {
  const t = useTranslations("reconciliation.uploadStatus");
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#ececec] bg-[#fafafa] px-4 py-3.5">
      <Spin />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-semibold">
          {fileName ? t("processingFile", { fileName }) : t("processingPortfolio")}
        </span>
        <span className="text-[13px] text-[#8a8a8a]">{t("processingHint")}</span>
      </div>
    </div>
  );
};

interface FailedPanelProps {
  upload: IConciliationUpload;
  onRetry: () => void;
  onDismiss: () => void;
}

/** La última carga no se aplicó: errores de validación por fila o falla del proceso. */
export const UploadFailedPanel = ({ upload, onRetry, onDismiss }: FailedPanelProps) => {
  const t = useTranslations("reconciliation.uploadStatus");
  const tCommon = useTranslations("common");
  const hiddenErrors = upload.error_count - upload.errors.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#f3b8b8] bg-white px-4 py-3.5">
      <div className="flex flex-wrap items-start gap-3">
        <WarningCircle size={22} weight="fill" className="mt-0.5 flex-none text-[#e5484d]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] font-semibold">
            {t("failedTitle", { fileName: upload.file_name })}
          </span>
          <span className="text-[13px] text-[#444]">
            {upload.error_message ?? t("processError")} {t("unchanged")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button type="text" onClick={onDismiss}>
            {tCommon("actions.hide")}
          </Button>
          <Button onClick={onRetry}>{t("retry")}</Button>
        </div>
      </div>

      {upload.errors.length > 0 && (
        <div className="max-h-[260px] overflow-auto rounded-md border border-[#ececec]">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 bg-cp-surface">
              <tr className="text-left text-[13.5px] text-cp-ink">
                <th className="w-[70px] border-b border-cp-line px-3 py-3 font-semibold">
                  {t("columns.row")}
                </th>
                <th className="w-[130px] border-b border-cp-line px-3 py-3 font-semibold">
                  {t("columns.column")}
                </th>
                <th className="border-b border-cp-line px-3 py-3 font-semibold">
                  {t("columns.fix")}
                </th>
              </tr>
            </thead>
            <tbody>
              {upload.errors.map((error, index) => (
                <tr
                  key={`${error.row}-${error.column}-${index}`}
                  className="border-t border-[#f0f0f0]"
                >
                  <td className="px-3 py-1.5 tabular-nums">
                    {error.row === null ? t("file") : formatNumber(error.row)}
                  </td>
                  <td className="px-3 py-1.5 text-[#444]">{error.column ?? "—"}</td>
                  <td className="px-3 py-1.5">{error.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hiddenErrors > 0 && (
        <span className="text-[13px] text-[#8a8a8a]">
          {t("hiddenErrors", {
            shown: formatNumber(upload.errors.length),
            total: formatNumber(upload.error_count)
          })}
        </span>
      )}
    </div>
  );
};
