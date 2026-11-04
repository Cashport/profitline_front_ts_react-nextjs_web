"use client";

/**
 * Carga del catalogo maestro de GMN oficiales (HU GMN + MATCH).
 *
 * Se integra en la pantalla existente "Auxiliares LATAM" (no crea modulo ni
 * entrada de menu). Flujo: estado inicial + ultima carga -> prevalidacion
 * (dry-run del backend, sin escritura) -> confirmacion explicita -> procesamiento
 * -> resultado. Reutiliza `UploadDropZone` y los patrones visuales actuales.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, Tag } from "antd";
import { CheckCircle, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import ProfitLoader from "@/components/ui/profit-loader/profit-loader";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";

import {
  GMN_OFICIALES_EXPECTED_COLUMNS,
  GMN_OFICIALES_MAX_FILE_SIZE_MB,
  GMN_OFICIALES_REQUIRED_COLUMNS,
  GMN_OFICIALES_SHEET_NAME,
  formatBytesToMB
} from "../../gmnOficiales/gmnOficiales.utils";
import {
  getGmnOficialesStatus,
  uploadGmnOficiales,
  validateGmnOficiales
} from "@/services/dataQuality/gmnOficiales";
import type {
  IGmnOficialesLoadResult,
  IGmnOficialesLoadRow,
  IGmnOficialesValidationReport
} from "@/types/dataQuality/IDataQuality";

type Stage = "idle" | "validating" | "invalid" | "preview" | "processing" | "result";

interface ModalGmnOficialesProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se invoca solo tras una carga confirmada por el backend. */
  onLoaded?: () => void;
}

const fmt = (value: number | null | undefined): string =>
  typeof value === "number" ? value.toLocaleString("es-CO") : "-";

const fmtDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("es-CO");
};

const errorMessageOf = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const StatChip: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-lg bg-[#F5F5F4] px-3 py-2">
    <p className="text-[13px] text-[#6B7280]">{label}</p>
    <p className="text-sm font-semibold text-[#141414]">{value}</p>
  </div>
);

export const ModalGmnOficiales: React.FC<ModalGmnOficialesProps> = ({
  isOpen,
  onClose,
  onLoaded
}) => {
  const t = useTranslations("dataQuality.gmnModal");
  const tCommon = useTranslations("common");
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<IGmnOficialesValidationReport | null>(null);
  const [result, setResult] = useState<IGmnOficialesLoadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(null);
  const [status, setStatus] = useState<IGmnOficialesLoadRow | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const submittingRef = useRef(false);

  const reset = useCallback(() => {
    setStage("idle");
    setFile(null);
    setReport(null);
    setResult(null);
    setErrorMsg(null);
    setErrorDetails(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reset();
    setIsStatusLoading(true);
    getGmnOficialesStatus()
      .then((row) => setStatus(row))
      .catch(() => setStatus(null))
      .finally(() => setIsStatusLoading(false));
  }, [isOpen, reset]);

  const handleSelect = useCallback(
    async (selected: File) => {
      setFile(selected);
      setErrorMsg(null);
      setErrorDetails(null);
      setReport(null);
      setResult(null);
      setStage("validating");
      try {
        const validated = await validateGmnOficiales(selected);
        setReport(validated);
        setStage("preview");
      } catch (error) {
        setErrorMsg(errorMessageOf(error, t("processError")));
        setErrorDetails((error as { data?: unknown })?.data ?? null);
        setStage("invalid");
      }
    },
    [t]
  );

  const handleConfirm = useCallback(async () => {
    if (!file || submittingRef.current) return; // previene envios duplicados
    submittingRef.current = true;
    setStage("processing");
    setErrorMsg(null);
    try {
      const loaded = await uploadGmnOficiales(file);
      setResult(loaded);
      setStage("result");
      onLoaded?.();
    } catch (error) {
      setErrorMsg(errorMessageOf(error, t("processError")));
      setErrorDetails((error as { data?: unknown })?.data ?? null);
      setStage("invalid");
    } finally {
      submittingRef.current = false;
    }
  }, [file, onLoaded, t]);

  const renderDetails = () => {
    if (!errorDetails) return null;
    const details = errorDetails as {
      missing?: string[];
      ambiguous?: { code: string; ids: number[] }[];
    };
    if (!details.missing && !details.ambiguous) return null;
    return (
      <div className="mt-2 space-y-1 text-[13px] text-[#7F1D1D]">
        {details.missing && details.missing.length > 0 && (
          <p>
            <span className="font-semibold">{t("unknownCountries")}</span>{" "}
            {details.missing.join(", ")}
          </p>
        )}
        {details.ambiguous && details.ambiguous.length > 0 && (
          <p>
            <span className="font-semibold">{t("ambiguousCountries")}</span>{" "}
            {details.ambiguous.map((a) => `${a.code} (IDs: ${a.ids.join(", ")})`).join(" | ")}
          </p>
        )}
      </div>
    );
  };

  const renderLastLoad = () => {
    if (isStatusLoading) return <p className="text-[13px] text-gray-400">{t("loadingLastLoad")}</p>;
    if (!status) return <p className="text-[13px] text-gray-500">{t("noLoadYet")}</p>;
    return (
      <div className="rounded-lg border border-[#EEEEEE] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-[#141414]">{t("lastLoad")}</p>
          <Tag color={status.status === "COMPLETED" ? "green" : "red"}>{status.status}</Tag>
        </div>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          {status.file_name} · {fmtDate(status.created_at)}
        </p>
        <p className="text-[13px] text-[#6B7280]">
          {t("lastLoadSummary", {
            inserted: fmt(status.rows_inserted),
            updated: fmt(status.rows_updated),
            conflicts: fmt(status.rows_conflict),
            skipped: fmt(status.rows_skipped)
          })}
        </p>
        <p className="text-[13px] text-gray-400">{t("loadId", { id: status.id })}</p>
        {status.error_message && (
          <p className="mt-1 text-[13px] text-[#DC2626]">{status.error_message}</p>
        )}
      </div>
    );
  };

  const renderFormat = () => (
    <div className="rounded-lg bg-[#FAFAF9] p-3 text-[13px] text-[#4B5563]">
      <p className="font-semibold text-[#141414]">{t("expectedFormat")}</p>
      <p className="mt-1">
        {t.rich("formatSheet", {
          sheet: GMN_OFICIALES_SHEET_NAME,
          required: GMN_OFICIALES_REQUIRED_COLUMNS.join(", "),
          size: GMN_OFICIALES_MAX_FILE_SIZE_MB,
          mono: (chunks) => <span className="font-mono">{chunks}</span>
        })}
      </p>
      <p className="mt-1 text-[13px] text-gray-500">
        {t.rich("formatColumns", {
          columns: GMN_OFICIALES_EXPECTED_COLUMNS.join(", "),
          mono: (chunks) => <span className="font-mono">{chunks}</span>
        })}
      </p>
      <p className="mt-1 text-[13px] text-gray-500">
        {t.rich("formatNote", {
          mono: (chunks) => <span className="font-mono">{chunks}</span>
        })}
      </p>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t("title")}
      footer={null}
      centered
      width={620}
      closable={stage !== "processing"}
      maskClosable={stage !== "processing"}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[#4B5563]">
          {t.rich("intro", { b: (chunks) => <b>{chunks}</b> })}
        </p>

        {stage === "idle" && (
          <>
            {renderLastLoad()}
            {renderFormat()}
            <UploadDropZone
              onFileUpload={handleSelect}
              allowedExtensions={[".xls", ".xlsx"]}
              title={t("dropTitle")}
            />
          </>
        )}

        {stage === "validating" && (
          <div className="flex flex-col items-center py-6">
            <ProfitLoader size="medium" message={t("validating")} />
          </div>
        )}

        {stage === "invalid" && (
          <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3">
            <div className="flex items-start gap-2">
              <WarningCircle size={18} className="mt-0.5 text-[#DC2626]" />
              <div>
                <p className="text-sm font-medium text-[#7F1D1D]">{t("cannotUpload")}</p>
                <p className="text-[13px] text-[#7F1D1D]">{errorMsg}</p>
                {renderDetails()}
              </div>
            </div>
          </div>
        )}

        {stage === "invalid" && (
          <div className="flex justify-end gap-2">
            <Button onClick={reset}>{t("chooseAnother")}</Button>
          </div>
        )}

        {stage === "preview" && report && (
          <>
            <div className="rounded-lg border border-[#EEEEEE] p-3">
              <p className="text-sm font-semibold text-[#141414]">{file?.name}</p>
              <p className="text-[13px] text-[#6B7280]">
                {t("fileInfo", { size: formatBytesToMB(file?.size), sheet: report.sheetName })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatChip label={t("stats.rowsRead")} value={fmt(report.rowsRead)} />
              <StatChip label={t("stats.countries")} value={fmt(report.countries.length)} />
              <StatChip label={t("stats.kept")} value={fmt(report.rowsKept)} />
              <StatChip label={t("stats.duplicated")} value={fmt(report.rowsDuplicated)} />
              <StatChip label={t("stats.multiRowKeys")} value={fmt(report.duplicateGmnKeys)} />
              <StatChip label={t("stats.skipped")} value={fmt(report.rowsSkipped)} />
            </div>

            {(report.duplicateGmnKeys ?? 0) > 0 && (
              <p className="text-[13px] text-[#B45309]">
                {t("previewDuplicateKeys", { count: report.duplicateGmnKeys ?? 0 })}
              </p>
            )}

            <div className="rounded-lg bg-[#F0FDF4] p-3 text-[13px] text-[#166534]">
              {t.rich("previewNote", { b: (chunks) => <b>{chunks}</b> })}
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={reset}>{t("chooseAnother")}</Button>
              <Button type="primary" onClick={handleConfirm}>
                {t("confirm")}
              </Button>
            </div>
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center py-6">
            <ProfitLoader size="medium" message={t("processing")} />
          </div>
        )}

        {stage === "result" && result && (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3">
              <CheckCircle size={18} className="text-[#16A34A]" />
              <div>
                <p className="text-sm font-medium text-[#166534]">{t("success")}</p>
                <p className="text-[13px] text-[#166534]">{t("loadId", { id: result.loadId })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatChip label={t("stats.rowsRead")} value={fmt(result.rowsRead)} />
              <StatChip label={t("stats.kept")} value={fmt(result.rowsKept)} />
              <StatChip label={t("stats.inserted")} value={fmt(result.rowsInserted)} />
              <StatChip label={t("stats.updated")} value={fmt(result.rowsUpdated)} />
              <StatChip label={t("stats.unchanged")} value={fmt(result.rowsUnchanged)} />
              <StatChip label={t("stats.deactivated")} value={fmt(result.rowsDeactivated)} />
              <StatChip label={t("stats.duplicated")} value={fmt(result.rowsDuplicated)} />
              <StatChip label={t("stats.multiRowKeys")} value={fmt(result.duplicateGmnKeys)} />
              <StatChip label={t("stats.skipped")} value={fmt(result.rowsSkipped)} />
            </div>

            {(result.duplicateGmnKeys ?? 0) > 0 && (
              <p className="text-[13px] text-[#B45309]">
                {t("resultDuplicateKeys", { count: result.duplicateGmnKeys ?? 0 })}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button icon={<UploadSimple size={16} />} onClick={reset}>
                {t("uploadAnother")}
              </Button>
              <Button type="primary" onClick={onClose}>
                {tCommon("actions.close")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ModalGmnOficiales;
