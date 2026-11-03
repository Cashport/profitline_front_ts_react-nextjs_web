import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "use-intl";

import {
  IColumnProfile,
  ILoaderValidationConfig,
  IValidationColumnConfig,
  ValidationCalc,
  ValidationColumnType,
  ValidationSeverity
} from "@/types/dataQuality/IIntakeStructure";
import { PlModalShell } from "./PlModalShell";

// Etiquetas en modals.intakeStructure.loaderValidations.{types,calcs,severities}.
const TYPE_OPTIONS: ValidationColumnType[] = [
  "text",
  "number",
  "integer",
  "date",
  "boolean",
  "any"
];

const CALC_OPTIONS: ValidationCalc[] = ["none", "sum", "count", "count_distinct", "avg"];

const SEVERITY_OPTIONS: ValidationSeverity[] = ["warning", "block"];

const WINDOW_OPTIONS = [3, 6, 12];

const isNumeric = (t: ValidationColumnType) => t === "number" || t === "integer";

const rulesOf = (c: IValidationColumnConfig) =>
  (c.type !== "any" ? 1 : 0) + (c.required ? 1 : 0) + (c.calc !== "none" ? 1 : 0);

interface Props {
  open: boolean;
  loaderName?: string | null;
  fileName?: string | null;
  /** Configuracion inicial (sugerida por el archivo o la ya guardada). */
  initial: ILoaderValidationConfig | null;
  /** Perfil de las columnas del archivo, para mostrar de donde sale la sugerencia. */
  profiles?: IColumnProfile[];
  /** "upload": bloquea la carga hasta guardar. "edit": desde el detalle del ETL. */
  mode: "upload" | "edit";
  // eslint-disable-next-line no-unused-vars
  onSave: (config: ILoaderValidationConfig) => Promise<void>;
  onCancel: () => void;
}

/** Asistente para definir las validaciones de contenido de un ETL. */
export const ModalLoaderValidations = ({
  open,
  loaderName,
  fileName,
  initial,
  profiles,
  mode,
  onSave,
  onCancel
}: Props) => {
  const t = useTranslations("modals.intakeStructure.loaderValidations");
  const tShared = useTranslations("modals.intakeStructure");
  const tCommon = useTranslations("common");
  const [config, setConfig] = useState<ILoaderValidationConfig | null>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initial);
    setError(null);
  }, [initial, open]);

  const profileByName = useMemo(
    () => new Map((profiles ?? []).map((p) => [p.name, p])),
    [profiles]
  );

  if (!config) return null;

  const totalRules = 1 + config.columns.reduce((n, c) => n + rulesOf(c), 0);

  const updateColumn = (index: number, patch: Partial<IValidationColumnConfig>) => {
    setError(null);
    setConfig((prev) => {
      if (!prev) return prev;
      const columns = prev.columns.map((c, i) => {
        if (i !== index) return c;
        const next = { ...c, ...patch };
        // Sumar y promediar solo tienen sentido en columnas numericas.
        if (!isNumeric(next.type) && (next.calc === "sum" || next.calc === "avg")) {
          next.calc = "none";
        }
        return next;
      });
      return { ...prev, columns };
    });
  };

  const handleSave = async () => {
    if (totalRules < 2) {
      setError(t("atLeastOneRule"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(config);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlModalShell
      open={open}
      onClose={onCancel}
      title={
        mode === "upload"
          ? `${t("titleUpload")}${loaderName ? ` · ${loaderName}` : ""}`
          : `${t("titleEdit")}${loaderName ? ` · ${loaderName}` : ""}`
      }
      fileName={fileName}
      meta={mode === "upload" ? t("templateSaved") : null}
      steps={
        mode === "upload"
          ? [
              { label: t("stepStructure"), state: "done" },
              { label: t("stepValidations"), state: "active" },
              { label: t("stepUpload"), state: "pending" }
            ]
          : undefined
      }
      heading={mode === "upload" ? t("headingUpload") : t("headingEdit")}
      subheading={mode === "upload" ? t("subheadingUpload") : t("subheadingEdit")}
      footer={
        <>
          <span className="plNote">{t("rulesToCreate", { count: totalRules })}</span>
          <span className="plSpacer" />
          <button type="button" className="plBtn" onClick={onCancel} disabled={saving}>
            {mode === "upload" ? tShared("cancelUpload") : tCommon("actions.cancel")}
          </button>
          <button
            type="button"
            className="plBtn plBtnPrimary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? tCommon("status.saving")
              : mode === "upload"
                ? t("saveAndUpload")
                : tCommon("actions.save")}
          </button>
        </>
      }
    >
      <div className="plCard">
        <div className="plRuleGrid plRuleGrid--head">
          <span>{t("columns.column")}</span>
          <span>{t("columns.type")}</span>
          <span>{t("columns.required")}</span>
          <span>{t("columns.calc")}</span>
          <span>{t("columns.deviation")}</span>
          <span>{t("columns.ifOut")}</span>
        </div>

        {config.columns.map((c, i) => {
          const p = profileByName.get(c.name);
          return (
            <div key={c.name} className="plRuleGrid">
              <span className="plColName">
                <span className="plCol" style={{ alignSelf: "flex-start" }}>
                  {c.name}
                </span>
                {p && (
                  <span className="plHint">
                    {p.cell} · {t("filled", { count: p.filled })}
                    {p.empty ? ` · ${t("empty", { count: p.empty })}` : ""}
                  </span>
                )}
              </span>
              <select
                aria-label={t("aria.type", { name: c.name })}
                value={c.type}
                onChange={(e) => updateColumn(i, { type: e.target.value as ValidationColumnType })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {t(`types.${o}`)}
                  </option>
                ))}
              </select>
              <input
                type="checkbox"
                aria-label={t("aria.required", { name: c.name })}
                checked={c.required}
                onChange={(e) => updateColumn(i, { required: e.target.checked })}
              />
              <select
                aria-label={t("aria.calc", { name: c.name })}
                value={c.calc}
                onChange={(e) => updateColumn(i, { calc: e.target.value as ValidationCalc })}
              >
                {CALC_OPTIONS.filter((o) => isNumeric(c.type) || (o !== "sum" && o !== "avg")).map(
                  (o) => (
                    <option key={o} value={o}>
                      {t(`calcs.${o}`)}
                    </option>
                  )
                )}
              </select>
              <input
                type="number"
                aria-label={t("aria.deviation", { name: c.name })}
                min={1}
                max={100}
                step={1}
                value={c.tolerance_pct}
                disabled={c.calc === "none"}
                onChange={(e) => updateColumn(i, { tolerance_pct: Number(e.target.value) })}
              />
              <select
                aria-label={t("aria.ifOut", { name: c.name })}
                value={c.severity}
                disabled={rulesOf(c) === 0}
                onChange={(e) =>
                  updateColumn(i, { severity: e.target.value as ValidationSeverity })
                }
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {t(`severities.${o}`)}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className="plRuleGrid">
          <span className="plColName">
            <span style={{ fontWeight: 700 }}>{t("rowCount")}</span>
            <span className="plHint">{t("alwaysChecked")}</span>
          </span>
          <span className="plHint">—</span>
          <span className="plHint">—</span>
          <span className="plHint">{t("countRows")}</span>
          <input
            type="number"
            aria-label={t("aria.rowCountDeviation")}
            min={1}
            max={100}
            step={1}
            value={config.row_count.tolerance_pct}
            onChange={(e) =>
              setConfig({
                ...config,
                row_count: { ...config.row_count, tolerance_pct: Number(e.target.value) }
              })
            }
          />
          <select
            aria-label={t("aria.rowCountIfOut")}
            value={config.row_count.severity}
            onChange={(e) =>
              setConfig({
                ...config,
                row_count: {
                  ...config.row_count,
                  severity: e.target.value as ValidationSeverity
                }
              })
            }
          >
            {SEVERITY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {t(`severities.${o}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="plWindowRow">
        {t("windowBefore")}
        <select
          aria-label={t("aria.window")}
          value={config.window}
          onChange={(e) => setConfig({ ...config, window: Number(e.target.value) })}
        >
          {[...new Set([...WINDOW_OPTIONS, config.window])]
            .sort((a, b) => a - b)
            .map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
        </select>
        {t("windowAfter", { count: config.window })}
      </div>
      <span className="plNote">{t("footnote")}</span>
      {error && <span className="plError">{error}</span>}
    </PlModalShell>
  );
};
