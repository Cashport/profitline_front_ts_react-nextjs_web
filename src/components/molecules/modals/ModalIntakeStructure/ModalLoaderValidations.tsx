import { useEffect, useMemo, useState } from "react";

import {
  IColumnProfile,
  ILoaderValidationConfig,
  IValidationColumnConfig,
  ValidationCalc,
  ValidationColumnType,
  ValidationSeverity
} from "@/types/dataQuality/IIntakeStructure";
import { PlModalShell } from "./PlModalShell";

const TYPE_OPTIONS: { value: ValidationColumnType; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "integer", label: "Entero" },
  { value: "date", label: "Fecha" },
  { value: "boolean", label: "Sí / No" },
  { value: "any", label: "Cualquiera" }
];

const CALC_OPTIONS: { value: ValidationCalc; label: string }[] = [
  { value: "none", label: "Ninguno" },
  { value: "sum", label: "Sumar" },
  { value: "count", label: "Contar" },
  { value: "count_distinct", label: "Contar distintos" },
  { value: "avg", label: "Promedio" }
];

const SEVERITY_OPTIONS: { value: ValidationSeverity; label: string }[] = [
  { value: "warning", label: "Advertir" },
  { value: "block", label: "Bloquear" }
];

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
      setError("Activa al menos una regla además del total de filas.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(config);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar las validaciones.");
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
          ? `Define las validaciones${loaderName ? ` · ${loaderName}` : ""}`
          : `Validaciones${loaderName ? ` · ${loaderName}` : ""}`
      }
      fileName={fileName}
      meta={mode === "upload" ? "el template ya está guardado" : null}
      steps={
        mode === "upload"
          ? [
              { label: "1 · Estructura", state: "done" },
              { label: "2 · Validaciones", state: "active" },
              { label: "3 · Cargue", state: "pending" }
            ]
          : undefined
      }
      heading={
        mode === "upload"
          ? "Este ETL todavía no tiene validaciones"
          : "Qué se revisa en cada cargue"
      }
      subheading={
        mode === "upload"
          ? "Elige qué revisar en cada columna antes de cargar. Las sugerencias salen del archivo."
          : "Los cambios aplican desde el próximo cargue."
      }
      footer={
        <>
          <span className="plNote">Se crearán {totalRules} reglas</span>
          <span className="plSpacer" />
          <button type="button" className="plBtn" onClick={onCancel} disabled={saving}>
            {mode === "upload" ? "Cancelar cargue" : "Cancelar"}
          </button>
          <button
            type="button"
            className="plBtn plBtnPrimary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando…" : mode === "upload" ? "Guardar y cargar" : "Guardar"}
          </button>
        </>
      }
    >
      <div className="plCard">
        <div className="plRuleGrid plRuleGrid--head">
          <span>Columna</span>
          <span>Tipo</span>
          <span>Oblig.</span>
          <span>Calcular</span>
          <span>Desv. %</span>
          <span>Si se sale</span>
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
                    {p.cell} · {p.filled} con valor
                    {p.empty ? ` · ${p.empty} vacías` : ""}
                  </span>
                )}
              </span>
              <select
                aria-label={`Tipo de ${c.name}`}
                value={c.type}
                onChange={(e) => updateColumn(i, { type: e.target.value as ValidationColumnType })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="checkbox"
                aria-label={`${c.name} obligatoria`}
                checked={c.required}
                onChange={(e) => updateColumn(i, { required: e.target.checked })}
              />
              <select
                aria-label={`Cálculo de ${c.name}`}
                value={c.calc}
                onChange={(e) => updateColumn(i, { calc: e.target.value as ValidationCalc })}
              >
                {CALC_OPTIONS.filter(
                  (o) => isNumeric(c.type) || (o.value !== "sum" && o.value !== "avg")
                ).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                aria-label={`Desviación permitida de ${c.name}`}
                min={1}
                max={100}
                step={1}
                value={c.tolerance_pct}
                disabled={c.calc === "none"}
                onChange={(e) => updateColumn(i, { tolerance_pct: Number(e.target.value) })}
              />
              <select
                aria-label={`Qué pasa si ${c.name} se sale`}
                value={c.severity}
                disabled={rulesOf(c) === 0}
                onChange={(e) =>
                  updateColumn(i, { severity: e.target.value as ValidationSeverity })
                }
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className="plRuleGrid">
          <span className="plColName">
            <span style={{ fontWeight: 700 }}>Total de filas</span>
            <span className="plHint">siempre se revisa</span>
          </span>
          <span className="plHint">—</span>
          <span className="plHint">—</span>
          <span className="plHint">Contar filas</span>
          <input
            type="number"
            aria-label="Desviación permitida del total de filas"
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
            aria-label="Qué pasa si el total de filas se sale"
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="plWindowRow">
        Comparar contra el promedio de las últimas
        <select
          aria-label="Cargas que forman el promedio"
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
        cargas
      </div>
      <span className="plNote">
        Mientras no haya cargas anteriores solo se revisan tipos y obligatorias; las desviaciones
        empiezan a contar desde la segunda carga. &quot;Bloquear&quot; detiene el cargue;
        &quot;Advertir&quot; lo deja pasar y queda en el historial.
      </span>
      {error && <span className="plError">{error}</span>}
    </PlModalShell>
  );
};
