"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { Bell, Check, ChevronDown, Download, TriangleAlert, Upload, X } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  cancelLoadAnalysis,
  confirmLoadAnalysis,
  forceLoadAnalysis,
  getLoadAnalysis,
  saveLoadAnalysisJustification
} from "@/services/marketAdmin/marketAdmin";
import {
  ILoadAnalysis,
  ILoadAnalysisCritical,
  ILoadAnalysisMeasure,
  ILoadAnalysisMeasureKey
} from "@/types/marketAdmin/IMarketAdmin";
import { useMessageApi } from "@/context/MessageContext";
import AnalysisSigmaChart from "./AnalysisSigmaChart";
import { COLORS, formatDelta, formatMeasure, formatSigma, sigmaColor } from "./analysisUtils";

dayjs.extend(utc);

const POLL_MS = 1500;
const MIN_JUSTIFICATION = 10;
const RUNNING = ["ANALYZING", "APPLYING"];

const ANALYSIS_STEPS = [
  "Leyendo el archivo",
  "Validando columnas, tipos de dato y duplicados",
  "Cruzando códigos con Cashport",
  "Comparando con los cargues de los últimos 60 días"
];
const STEP_INDEX: Record<string, number> = {
  READING: 0,
  VALIDATING: 1,
  MATCHING_CLIENTS: 2,
  MEASURING: 3,
  DONE: 3
};

const PLACEHOLDERS: Record<ILoadAnalysisMeasureKey, string> = {
  total_balance: "Ej.: el cliente aplicó un castigo de cartera aprobado esta semana.",
  active_clients: "Ej.: se depuraron clientes inactivos del maestro.",
  documents: "Ej.: se cerró un lote grande de facturas pagadas."
};

const btn =
  "inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 rounded-lg border text-[13px] font-semibold transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
const btnDefault = `${btn} border-[#C2CFD3] bg-white text-[#011822] hover:border-[#011822]`;
const btnPrimary = `${btn} border-[#FF5500] bg-[#FF5500] text-white font-bold hover:bg-[#E04A00]`;
const sora = { fontFamily: "'Sora', var(--font-sans, sans-serif)" };

type Props = {
  open: boolean;
  loaderId: number | null;
  analysisId: number | null;
  loaderName: string | null;
  templateUrl?: string;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onUploadCorrected: (file?: File) => void;
};

const toLocal = (value: string | null) =>
  value ? dayjs.utc(value).local().format("DD/MM/YYYY HH:mm") : "—";

function CriticalRow({ item, last }: { item: ILoadAnalysisCritical; last: boolean }) {
  const columns = item.code === "MISSING_COLUMNS" ? [] : item.columns ?? [];
  return (
    <div
      className="flex gap-3 items-start px-[18px] py-3.5"
      style={{ borderBottom: last ? "none" : "1px solid #EEF2F3" }}
    >
      <span className="w-2 h-2 rounded-full flex-none mt-1.5" style={{ background: COLORS.red }} />
      <div className="flex-1 flex flex-col gap-1">
        {item.code === "MISSING_COLUMNS" ? (
          <span>
            <strong>Faltan columnas:</strong>{" "}
            {(item.columns ?? []).map((c) => (
              <span key={c} className="font-mono text-xs bg-[#F1F4F5] px-1.5 py-px rounded mr-1">
                {c}
              </span>
            ))}
          </span>
        ) : (
          <strong>{item.message}</strong>
        )}
        {columns.length > 0 && item.code !== "DUPLICATES" && (
          <span className="text-xs" style={{ color: COLORS.muted }}>
            Columna{columns.length > 1 ? "s" : ""}:{" "}
            {columns.map((c) => (
              <span key={c} className="font-mono bg-[#F1F4F5] px-1.5 py-px rounded mr-1">
                {c}
              </span>
            ))}
          </span>
        )}
        {!!item.sample_rows?.length && (
          <span className="text-xs" style={{ color: COLORS.muted }}>
            Filas: {item.sample_rows.join(", ")}
            {item.count > item.sample_rows.length ? "…" : ""}
          </span>
        )}
        {!!item.sample_values?.length && (
          <span className="text-xs" style={{ color: COLORS.muted }}>
            Códigos: {item.sample_values.join(", ")}
            {item.count > item.sample_values.length ? "…" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ModalValidacionCargue({
  open,
  loaderId,
  analysisId,
  loaderName,
  templateUrl,
  onClose,
  onUploadCorrected
}: Props) {
  const { showMessage } = useMessageApi();
  const [analysis, setAnalysis] = useState<ILoadAnalysis | null>(null);
  const [opens, setOpens] = useState<Partial<Record<ILoadAnalysisMeasureKey, boolean>>>({});
  const [drafts, setDrafts] = useState<Partial<Record<ILoadAnalysisMeasureKey, string>>>({});
  const [editing, setEditing] = useState<Partial<Record<ILoadAnalysisMeasureKey, boolean>>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [forceOpen, setForceOpen] = useState(false);
  const [forceText, setForceText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const openedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setAnalysis(null);
      setOpens({});
      setDrafts({});
      setEditing({});
      setForceOpen(false);
      setForceText("");
      openedFor.current = null;
    }
  }, [open]);

  const applying = analysis?.status === "APPLYING";

  useEffect(() => {
    if (!open || !loaderId || !analysisId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const data = await getLoadAnalysis(loaderId, analysisId);
        if (stopped) return;
        setAnalysis(data);
        if (RUNNING.includes(data.status)) timer = setTimeout(poll, POLL_MS);
      } catch {
        if (!stopped) timer = setTimeout(poll, POLL_MS * 2);
      }
    };
    poll();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, loaderId, analysisId, applying]);

  useEffect(() => {
    if (analysis?.status !== "READY" || openedFor.current === analysis.analysis_id) return;
    openedFor.current = analysis.analysis_id;
    const first =
      analysis.measures.find((m) => m.requires_justification && !m.justification) ??
      analysis.measures[0];
    if (first) setOpens({ [first.key]: true });
  }, [analysis]);

  if (!loaderId || !analysisId) return null;

  const status = analysis?.status ?? "ANALYZING";
  const warnings = analysis?.measures.filter((m) => m.requires_justification) ?? [];

  const run = async (key: string, action: () => Promise<ILoadAnalysis>, ok?: string) => {
    setBusy(key);
    try {
      const data = await action();
      setAnalysis(data);
      if (ok) showMessage("success", ok);
      return data;
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "No se pudo completar la acción."
      );
      return null;
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = () => {
    if (status !== "ANALYZING" && status !== "READY") {
      onClose();
      return;
    }
    Modal.confirm({
      title: "¿Cancelar el cargue?",
      content: "El archivo no se aplicará en Cashport.",
      okText: "Cancelar cargue",
      cancelText: "Seguir",
      okButtonProps: { danger: true },
      onOk: async () => {
        const data = await run("cancel", () => cancelLoadAnalysis(loaderId, analysisId));
        if (data) onClose();
      }
    });
  };

  const saveJustification = async (measure: ILoadAnalysisMeasure) => {
    const text = (drafts[measure.key] ?? measure.justification?.justification ?? "").trim();
    if (text.length < MIN_JUSTIFICATION) return;
    const data = await run(`save-${measure.key}`, () =>
      saveLoadAnalysisJustification(loaderId, analysisId, measure.key, text)
    );
    if (!data) return;
    setEditing((e) => ({ ...e, [measure.key]: false }));
    const next = data.measures.find(
      (m) => m.key !== measure.key && m.requires_justification && !m.justification
    );
    setOpens((o) => ({ ...o, [measure.key]: false, ...(next ? { [next.key]: true } : {}) }));
  };

  const confirm = () => run("confirm", () => confirmLoadAnalysis(loaderId, analysisId));

  const forceLoad = () => {
    const text = forceText.trim();
    if (text.length < MIN_JUSTIFICATION) return;
    return run("force", () => forceLoadAnalysis(loaderId, analysisId, text));
  };

  const pickFile = () => fileRef.current?.click();

  const title =
    status === "APPLIED" ? "Cargue confirmado" : loaderName ?? analysis?.loader_name ?? "Cargue";

  const stageDefs = [
    {
      label: "1 · Críticas",
      active: status === "CRITICAL",
      done: ["READY", "APPLYING", "APPLIED"].includes(status)
    },
    {
      label: "2 · Advertencias",
      active: status === "READY",
      done: ["APPLYING", "APPLIED"].includes(status)
    },
    { label: "3 · Confirmar", active: status === "APPLYING", done: status === "APPLIED" }
  ];

  const fileMeta = (() => {
    if (!analysis) return "";
    if (status === "APPLIED") return `Confirmado ${toLocal(analysis.confirmed_at)}`;
    const rows =
      analysis.rows_raw !== null ? `${formatMeasure("count", analysis.rows_raw)} filas · ` : "";
    if (status === "APPLYING")
      return `${rows}${analysis.justified_count} advertencias justificadas`;
    return `${rows}subido ${toLocal(analysis.created_at)}`;
  })();

  const loadingPanel = (applying: boolean) => {
    const pct = applying ? null : Math.min(100, analysis?.progress ?? 0);
    const stepIdx = STEP_INDEX[analysis?.step ?? "READING"] ?? 0;
    return (
      <>
        <div
          className="flex flex-col gap-[22px] px-7 py-8"
          style={{ background: COLORS.bg, borderTop: "1px solid #EEF2F3" }}
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gifs/Profitline_Motion_Isotipo_Positivo.gif"
              alt="Cargando"
              className="w-16 h-16 flex-none"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <h3 className="m-0 text-base font-semibold tracking-[-.01em]" style={sora}>
                {applying ? "Cargando la cartera" : "Analizando el archivo"}
              </h3>
              <span className="text-[12.5px]" style={{ color: COLORS.muted }}>
                {applying
                  ? "Estamos aplicando el archivo en Cashport."
                  : `${ANALYSIS_STEPS[stepIdx]}. Nada se aplica hasta que confirmes.`}
              </span>
            </div>
            {pct !== null && (
              <span className="text-lg font-semibold tabular-nums" style={sora}>
                {pct}%
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-md overflow-hidden" style={{ background: COLORS.line }}>
            <div
              className={`h-full rounded-md transition-all duration-500 ${applying ? "animate-pulse w-full" : ""}`}
              style={{ background: COLORS.orange, width: applying ? "100%" : `${pct}%` }}
            />
          </div>
          <div
            className="flex items-center gap-2.5 bg-white rounded-[10px] px-3.5 py-3 text-[12.5px]"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink2 }}
          >
            <Bell size={16} className="flex-none" />
            <span className="flex-1">
              Si el archivo es grande puede tardar unos minutos. Puedes cerrar esta ventana y
              retomarlo desde el historial de cargues.
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2.5 px-7 py-3.5"
          style={{ borderTop: "1px solid #EEF2F3" }}
        >
          {applying ? (
            <button type="button" className={btnDefault} onClick={onClose}>
              Cerrar
            </button>
          ) : (
            <button
              type="button"
              className={btnDefault}
              onClick={handleCancel}
              disabled={busy === "cancel"}
            >
              Cancelar cargue
            </button>
          )}
        </div>
      </>
    );
  };

  const criticalPanel = () => {
    const items = analysis?.criticals ?? [];
    return (
      <>
        <div
          className="flex flex-col gap-3.5 px-7 py-[22px]"
          style={{ background: COLORS.bg, borderTop: "1px solid #EEF2F3" }}
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="m-0 text-base font-semibold tracking-[-.01em]" style={sora}>
              {items.length} {items.length === 1 ? "alerta crítica" : "alertas críticas"}
            </h3>
            <span className="text-[12.5px]" style={{ color: COLORS.ink2 }}>
              {analysis?.can_force
                ? "Corrige el archivo y vuelve a cargarlo, o cárgalo de todas formas justificando por qué."
                : "Corrige el archivo y vuelve a cargarlo."}
            </span>
          </div>
          <div
            className="bg-white rounded-xl flex flex-col"
            style={{ border: `1px solid ${COLORS.line}` }}
          >
            {items.map((item, i) => (
              <CriticalRow key={`${item.code}-${i}`} item={item} last={i === items.length - 1} />
            ))}
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) onUploadCorrected(file);
            }}
            className="rounded-xl p-[18px] flex items-center gap-3.5 bg-white flex-wrap"
            style={{ border: `1.5px dashed ${dragOver ? COLORS.orange : "#B1BBC1"}` }}
          >
            <span
              className="w-10 h-10 rounded-[10px] grid place-items-center"
              style={{ background: COLORS.orangeSoft }}
            >
              <Upload size={18} color={COLORS.orange} />
            </span>
            <div className="flex-[1_1_200px] flex flex-col">
              <span className="font-bold">Arrastra aquí el archivo corregido</span>
              <span className="text-xs" style={{ color: COLORS.muted }}>
                Se vuelve a validar desde la etapa 1
              </span>
            </div>
            <button type="button" className={btnPrimary} onClick={pickFile}>
              Seleccionar archivo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onUploadCorrected(file);
              }}
            />
          </div>
          {forceOpen && (
            <div
              className="rounded-xl p-[18px] flex flex-col gap-2.5 bg-white"
              style={{ border: `1px solid ${COLORS.orangeLine}` }}
            >
              <div className="flex gap-2.5 items-start">
                <TriangleAlert size={18} color={COLORS.orangeInk} className="flex-none mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold">Cargar con {items.length} alertas críticas</span>
                  <span className="text-xs" style={{ color: COLORS.muted }}>
                    Los datos con error se cargan tal como vienen en el archivo. Queda registrado en
                    la bitácora con tu usuario y esta justificación.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label="Justificación para cargar con alertas críticas"
                  value={forceText}
                  placeholder="Ej.: el cliente confirmó que los saldos son correctos; se corrige en el próximo cargue."
                  onChange={(e) => setForceText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") forceLoad();
                  }}
                  className="flex-1 min-w-0 rounded-lg px-3 h-[38px] text-[13px] bg-white focus:outline-none"
                  style={{ border: `1px solid ${COLORS.orangeLine}`, color: COLORS.ink }}
                />
                <button
                  type="button"
                  onClick={forceLoad}
                  disabled={forceText.trim().length < MIN_JUSTIFICATION || busy === "force"}
                  className="border-0 rounded-lg px-3.5 h-[38px] text-[12.5px] font-bold text-white whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: COLORS.orange }}
                >
                  Cargar con alertas
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="flex items-center gap-2.5 px-7 py-3.5 flex-wrap"
          style={{ borderTop: "1px solid #EEF2F3" }}
        >
          <button type="button" className={btnDefault} onClick={onClose}>
            Cerrar
          </button>
          <span className="ml-auto" />
          {analysis?.can_force && !forceOpen && (
            <button type="button" className={btnDefault} onClick={() => setForceOpen(true)}>
              Cargar de todas formas
            </button>
          )}
          {templateUrl && (
            <button
              type="button"
              className={btnDefault}
              onClick={() => window.open(templateUrl, "_blank", "noopener,noreferrer")}
            >
              <Download size={15} /> Descargar template
            </button>
          )}
        </div>
      </>
    );
  };

  const measureCard = (m: ILoadAnalysisMeasure, firstNormal: boolean) => {
    const isWarn = m.requires_justification;
    const isOpen = !!opens[m.key];
    const saved = m.justification?.justification ?? "";
    const isEditing = isWarn && (!saved || !!editing[m.key]);
    const justified = isWarn && !!saved && !isEditing;
    const draft = drafts[m.key] ?? saved;
    const canSave = draft.trim().length >= MIN_JUSTIFICATION;
    return (
      <div key={m.key} className="flex flex-col gap-3">
        {firstNormal && (
          <div className="flex flex-col gap-0.5 pt-2">
            <h3 className="m-0 text-sm font-semibold" style={sora}>
              Dentro de lo normal
            </h3>
            <span className="text-xs" style={{ color: COLORS.muted }}>
              Ábrelas para ver su comportamiento de los últimos {analysis?.history_days ?? 60} días.
            </span>
          </div>
        )}
        <div
          className="bg-white rounded-xl flex flex-col"
          style={{
            border: `1px solid ${isWarn ? (justified ? "#DCE4E6" : "#FFC9AE") : COLORS.line}`
          }}
        >
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setOpens((o) => ({ ...o, [m.key]: !isOpen }))}
            className="grid items-center gap-3.5 px-[18px] py-4 bg-transparent border-0 text-left min-h-[56px] cursor-pointer"
            style={{ gridTemplateColumns: "minmax(0, 1fr) auto 20px", color: COLORS.ink }}
          >
            <span className="flex flex-col gap-[3px] min-w-0">
              <span
                className="text-[10.5px] font-bold tracking-[.1em]"
                style={{ color: COLORS.muted }}
              >
                {m.label.toUpperCase()}
              </span>
              <span className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-semibold tracking-[-.02em] tabular-nums"
                  style={{ ...sora, fontSize: isWarn ? 24 : 19 }}
                >
                  {formatMeasure(m.unit, m.value)}
                </span>
                {m.level !== "NO_BASELINE" ? (
                  <>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isWarn ? COLORS.orangeInk : COLORS.muted }}
                    >
                      {formatSigma(m.z_score)}
                      {m.delta_pct !== null ? ` · ${formatDelta(m.delta_pct)}` : ""}
                    </span>
                    <span className="text-xs" style={{ color: COLORS.faint }}>
                      media {formatMeasure(m.unit, m.mean)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: COLORS.faint }}>
                    Sin cargues previos suficientes para comparar
                  </span>
                )}
              </span>
              {justified && !isOpen && (
                <span
                  className="text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ color: COLORS.ink2 }}
                >
                  “{saved}”
                </span>
              )}
            </span>
            <span className="w-[30px] grid place-items-center">
              {isWarn && (
                <span
                  role="img"
                  title={justified ? "Justificada" : "Falta justificar"}
                  aria-label={justified ? "Justificada" : "Falta justificar"}
                  className="w-7 h-7 rounded-full grid place-items-center"
                  style={{
                    background: justified ? COLORS.lime : COLORS.orangeSoft,
                    boxShadow: justified ? "none" : `inset 0 0 0 1.5px ${COLORS.orangeLine}`
                  }}
                >
                  {justified ? (
                    <Check size={15} strokeWidth={2.6} color={COLORS.ink} />
                  ) : (
                    <TriangleAlert size={15} strokeWidth={2.2} color={COLORS.orangeInk} />
                  )}
                </span>
              )}
            </span>
            <ChevronDown
              size={16}
              color={COLORS.muted}
              style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
            />
          </button>
          {isOpen && (
            <div className="px-[18px] pb-[18px] flex flex-col gap-2.5">
              <AnalysisSigmaChart measure={m} historyDays={analysis?.history_days ?? 60} />
              {isEditing && (
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    aria-label="Justificación"
                    value={draft}
                    placeholder={PLACEHOLDERS[m.key]}
                    onChange={(e) => setDrafts((d) => ({ ...d, [m.key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSave) saveJustification(m);
                    }}
                    className="flex-1 min-w-0 rounded-lg px-3 h-[38px] text-[13px] bg-white focus:outline-none"
                    style={{ border: `1px solid ${COLORS.orangeLine}`, color: COLORS.ink }}
                  />
                  <button
                    type="button"
                    onClick={() => saveJustification(m)}
                    disabled={!canSave || busy === `save-${m.key}`}
                    className="border-0 rounded-lg px-3.5 h-[38px] text-[12.5px] font-bold text-white whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: COLORS.ink }}
                  >
                    Guardar
                  </button>
                </div>
              )}
              {justified && (
                <div
                  className="flex items-center gap-2 rounded-lg pl-2.5 pr-1.5 h-[38px]"
                  style={{ background: COLORS.soft }}
                >
                  <span
                    className="w-[18px] h-[18px] rounded-full grid place-items-center flex-none"
                    style={{ background: COLORS.lime }}
                  >
                    <Check size={10} strokeWidth={3.2} color={COLORS.ink} />
                  </span>
                  <span
                    className="flex-1 min-w-0 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: COLORS.ink2 }}
                  >
                    {saved}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing((e) => ({ ...e, [m.key]: true }));
                      setDrafts((d) => ({ ...d, [m.key]: saved }));
                    }}
                    className="border-0 bg-transparent text-xs font-semibold underline cursor-pointer px-2 h-[30px]"
                    style={{ color: COLORS.muted }}
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const warningsPanel = () => {
    const measures = analysis?.measures ?? [];
    const done = warnings.filter((m) => m.justification).length;
    let seenNormal = false;
    return (
      <>
        <div
          className="flex flex-col gap-3 px-7 py-[22px]"
          style={{ background: COLORS.bg, borderTop: "1px solid #EEF2F3" }}
        >
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-[1_1_260px] flex flex-col gap-0.5">
              <h3 className="m-0 text-base font-semibold tracking-[-.01em]" style={sora}>
                {warnings.length
                  ? `${warnings.length} ${warnings.length === 1 ? "advertencia" : "advertencias"} por resolver`
                  : "Sin advertencias"}
              </h3>
              <span className="text-[12.5px]" style={{ color: COLORS.ink2 }}>
                {warnings.length
                  ? "Cada una necesita su propia justificación antes de confirmar."
                  : "Todas las medidas están dentro de lo normal. Puedes confirmar el cargue."}
              </span>
            </div>
            <div
              className="flex gap-3.5 text-[11px] pb-0.5 flex-wrap"
              style={{ color: COLORS.muted }}
            >
              <span className="inline-flex gap-1.5 items-center">
                <span
                  className="w-3.5 h-2.5 rounded-sm"
                  style={{ background: COLORS.soft, boxShadow: `inset 0 0 0 1px ${COLORS.line}` }}
                />
                Normal
              </span>
              <span className="inline-flex gap-1.5 items-center">
                <span className="w-3.5" style={{ borderTop: `1.5px dashed ${COLORS.ink}` }} />
                ±1σ
              </span>
              <span className="inline-flex gap-1.5 items-center">
                <span className="w-3.5" style={{ borderTop: `1.5px dashed ${COLORS.orange}` }} />
                ±2σ
              </span>
              <span className="inline-flex gap-1.5 items-center">
                <span className="w-3.5" style={{ borderTop: `1.5px dashed ${COLORS.red}` }} />
                ±3σ
              </span>
            </div>
          </div>
          {measures.map((m) => {
            const firstNormal = !m.requires_justification && !seenNormal && warnings.length > 0;
            if (!m.requires_justification) seenNormal = true;
            return measureCard(m, firstNormal);
          })}
        </div>
        <div
          className="flex items-center gap-3.5 px-7 py-3.5 flex-wrap"
          style={{ borderTop: "1px solid #EEF2F3" }}
        >
          <button
            type="button"
            className={btnDefault}
            onClick={handleCancel}
            disabled={busy === "cancel"}
          >
            Cancelar cargue
          </button>
          <div className="ml-auto flex items-center gap-2.5">
            {warnings.length > 0 && (
              <>
                <div className="flex gap-1">
                  {warnings.map((m, i) => (
                    <span
                      key={m.key}
                      className="w-[22px] h-1.5 rounded-md"
                      style={{ background: i < done ? COLORS.lime : COLORS.line }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: COLORS.ink2 }}>
                  {done} de {warnings.length} justificadas
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            className={btnPrimary}
            onClick={confirm}
            disabled={!analysis?.can_confirm || busy === "confirm"}
          >
            Confirmar cargue
          </button>
        </div>
      </>
    );
  };

  const appliedPanel = () => {
    const measures = analysis?.measures ?? [];
    return (
      <>
        <div
          className="px-7 py-5 flex flex-col gap-3"
          style={{ background: COLORS.bg, borderTop: "1px solid #EEF2F3" }}
        >
          <span className="text-[10.5px] font-bold tracking-[.1em]" style={{ color: COLORS.muted }}>
            LO QUE SE CARGÓ
          </span>
          <div
            className="bg-white rounded-lg overflow-hidden w-full"
            style={{ border: `1px solid ${COLORS.line}` }}
          >
            <table className="w-full border-collapse table-fixed text-[12.5px]">
              <thead>
                <tr style={{ background: "#F7F9F9" }}>
                  {[
                    { label: "MEDIDA", align: "left", width: 216 },
                    { label: "CARGADO", align: "right", width: 110 },
                    {
                      label: `MEDIA ${analysis?.summary_days ?? 30} D`,
                      align: "right",
                      width: 110
                    },
                    { label: `${analysis?.summary_days ?? 30} DÍAS`, align: "left", width: 90 }
                  ].map((h) => (
                    <th
                      key={h.label}
                      className="px-2 py-[9px] text-[10px] font-bold tracking-[.06em] whitespace-nowrap"
                      style={{
                        textAlign: h.align as "left" | "right",
                        width: h.width,
                        color: COLORS.muted,
                        borderBottom: `1px solid ${COLORS.line}`
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measures.map((m, i) => {
                  const border = i === measures.length - 1 ? "0" : "1px solid #EEF2F3";
                  const vals = [...m.history_30d.map((p) => p.value), m.value];
                  const lo = Math.min(...vals);
                  const hi = Math.max(...vals);
                  const span = hi - lo || 1;
                  const y = (v: number) => 2 + ((hi - v) / span) * 16;
                  const x = (j: number) =>
                    vals.length > 1 ? 2 + j * (94 / (vals.length - 1)) : 50;
                  return (
                    <tr key={m.key}>
                      <td
                        className="px-2 py-[7px] pl-3.5 font-medium"
                        style={{ borderBottom: border }}
                      >
                        {m.label}
                      </td>
                      <td
                        className="px-1 py-[7px] text-xs text-right font-semibold tabular-nums whitespace-nowrap"
                        style={{ ...sora, borderBottom: border }}
                      >
                        {formatMeasure(m.unit, m.value)}
                      </td>
                      <td
                        className="px-1 py-[7px] text-xs text-right tabular-nums whitespace-nowrap"
                        style={{ color: COLORS.muted, borderBottom: border }}
                      >
                        {formatMeasure(m.unit, m.mean_30d)}
                      </td>
                      <td className="px-2 py-1" style={{ borderBottom: border }}>
                        <div className="relative h-5">
                          <svg
                            viewBox="0 0 100 20"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full"
                          >
                            <polyline
                              points={vals
                                .map((v, j) => `${x(j).toFixed(2)},${y(v).toFixed(1)}`)
                                .join(" ")}
                              fill="none"
                              stroke="#A3B2B9"
                              strokeWidth="1"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                          <div
                            className="absolute w-1.5 h-1.5 rounded-full"
                            style={{
                              left: `${x(vals.length - 1)}%`,
                              top: y(m.value),
                              background: sigmaColor(m.z_score),
                              boxShadow: `0 0 0 1.2px ${COLORS.ink}`,
                              transform: "translate(-50%, -50%)"
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="grid gap-y-1.5 text-[12.5px] pt-1"
            style={{ gridTemplateColumns: "120px minmax(0, 1fr)" }}
          >
            <span style={{ color: COLORS.muted }}>Archivo</span>
            <span className="font-mono text-xs">{analysis?.file_name}</span>
            <span style={{ color: COLORS.muted }}>Confirmado por</span>
            <span>
              {analysis?.confirmed_by ?? "—"} · {toLocal(analysis?.confirmed_at ?? null)}
            </span>
            <span style={{ color: COLORS.muted }}>Advertencias</span>
            <span>
              {analysis?.justified_count
                ? `${analysis.justified_count} justificadas · quedaron en la bitácora`
                : "Ninguna"}
            </span>
            {analysis?.critical_override && (
              <>
                <span style={{ color: COLORS.muted }}>Alertas críticas</span>
                <span>
                  Cargado con {analysis.criticals.length} alertas · “
                  {analysis.critical_override.justification}”
                </span>
              </>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-2.5 px-7 py-3.5"
          style={{ borderTop: "1px solid #EEF2F3" }}
        >
          <span className="ml-auto" />
          <button type="button" className={btnPrimary} onClick={onClose}>
            Listo
          </button>
        </div>
      </>
    );
  };

  const messagePanel = (heading: string, text: string) => (
    <>
      <div
        className="flex flex-col gap-1 px-7 py-[22px]"
        style={{ background: COLORS.bg, borderTop: "1px solid #EEF2F3" }}
      >
        <h3 className="m-0 text-base font-semibold" style={sora}>
          {heading}
        </h3>
        <span className="text-[12.5px]" style={{ color: COLORS.ink2 }}>
          {text}
        </span>
      </div>
      <div
        className="flex items-center gap-2.5 px-7 py-3.5"
        style={{ borderTop: "1px solid #EEF2F3" }}
      >
        <button type="button" className={btnDefault} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </>
  );

  const body = () => {
    switch (status) {
      case "ANALYZING":
        return loadingPanel(false);
      case "APPLYING":
        return loadingPanel(true);
      case "CRITICAL":
        return criticalPanel();
      case "READY":
        return warningsPanel();
      case "APPLIED":
        return appliedPanel();
      case "CANCELLED":
        return messagePanel("Cargue cancelado", "El archivo no se aplicó en Cashport.");
      default:
        return messagePanel(
          "No se pudo completar el cargue",
          analysis?.error_message ?? "Revisa el historial de cargues para ver el detalle."
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable={false}
      width={880}
      destroyOnClose
      styles={{ content: { padding: 0, borderRadius: 14, overflow: "hidden" } }}
    >
      <div className="text-[13.5px] leading-[1.45]" style={{ color: COLORS.ink }}>
        <div className="px-7 pt-[22px] flex flex-col gap-3.5">
          <div className="flex items-start gap-4">
            {status === "APPLIED" && (
              <span
                className="w-11 h-11 rounded-[13px] grid place-items-center flex-none"
                style={{ background: COLORS.lime }}
              >
                <Check size={20} strokeWidth={2.6} color={COLORS.ink} />
              </span>
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <span
                className="text-[10.5px] font-bold tracking-[.14em]"
                style={{ color: COLORS.orange }}
              >
                CASHPORT · VALIDACIÓN DE CARGUE
              </span>
              <h2 className="m-0 text-[21px] font-semibold tracking-[-.02em]" style={sora}>
                {title}
              </h2>
              {status !== "APPLIED" && analysis && (
                <div
                  className="flex gap-2 items-center flex-wrap text-xs"
                  style={{ color: COLORS.muted }}
                >
                  <span
                    className="font-mono text-[11.5px] px-[9px] py-[3px] rounded-md"
                    style={{ background: COLORS.soft, color: COLORS.ink2 }}
                  >
                    {analysis.file_name}
                  </span>
                  <span>{fileMeta}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="border-0 rounded-[10px] w-10 h-10 grid place-items-center cursor-pointer flex-none"
              style={{ background: COLORS.soft, color: COLORS.ink2 }}
            >
              <X size={16} />
            </button>
          </div>
          {status === "APPLIED" && (
            <span style={{ color: COLORS.ink2 }}>La cartera ya está disponible en Cashport.</span>
          )}
          <div className="grid grid-cols-3 gap-1.5 pb-4">
            {stageDefs.map((g, i) => {
              const activeColor = i === 0 ? COLORS.red : COLORS.orange;
              const activeInk = i === 0 ? COLORS.red : COLORS.orangeInk;
              return (
                <div key={g.label} className="flex flex-col gap-[7px]">
                  <span
                    className="h-1 rounded"
                    style={{
                      background: g.done ? COLORS.lime : g.active ? activeColor : COLORS.line
                    }}
                  />
                  <span
                    className="text-[11.5px]"
                    style={{
                      fontWeight: g.active ? 700 : 600,
                      color: g.done ? COLORS.ink2 : g.active ? activeInk : COLORS.faint
                    }}
                  >
                    {status === "APPLIED" ? "" : g.done ? `✓ ${g.label.slice(4)}` : g.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {body()}
      </div>
    </Modal>
  );
}
