"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Upload } from "antd";
import { CheckCircle, DownloadSimple, FileXls, UploadSimple, WarningCircle } from "phosphor-react";
import dayjs from "dayjs";

import { useMessageApi } from "@/context/MessageContext";
import { useClosingsDark } from "../../containers/closings-layout/closings-layout";
import { downloadClosingTemplate, getClosing, uploadClosing } from "@/services/closings/closings";
import type { IClosingInfo } from "@/types/closings/IClosings";

import { formatAmount, periodLabel } from "../../utils/format";
import { downloadPendingClients } from "../../utils/pending-clients";

interface Props {
  open: boolean;
  /** Meses que ya tienen cierre (no se pueden volver a cargar sin eliminarlos). */
  loadedPeriods: string[];
  onClose: () => void;
  /** Se llama cuando el cierre queda listo, para refrescar el tablero y abrirlo. */
  onLoaded: (period: string) => void;
}

const POLL_MS = 3000;

/** Últimos 12 meses, el anterior al actual primero (el cierre que normalmente se carga). */
const monthOptions = () =>
  Array.from({ length: 12 }, (_, i) =>
    dayjs()
      .subtract(i + 1, "month")
      .format("YYYY-MM")
  );

export default function LoadClosingModal({ open, loadedPeriods, onClose, onLoaded }: Props) {
  const { showMessage } = useMessageApi();
  const isDark = useClosingsDark();
  const months = useMemo(monthOptions, []);
  const [period, setPeriod] = useState(months[0]);
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState<IClosingInfo | null>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setJob(null);
    setSending(false);
    setPeriod(months.find((m) => !loadedPeriods.includes(m)) ?? months[0]);
  }, [open, months, loadedPeriods]);

  useEffect(() => {
    if (job?.status !== "PROCESSING") return;
    const timer = setTimeout(async () => {
      try {
        const next = await getClosing(job.id);
        setJob(next);
        if (next.status === "READY") onLoaded(next.period);
      } catch {
        setJob({ ...job });
      }
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [job, onLoaded]);

  const submit = async () => {
    if (!file) return;
    setSending(true);
    try {
      setJob(await uploadClosing(period, file));
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo cargar el cierre");
    } finally {
      setSending(false);
    }
  };

  const template = async () => {
    try {
      await downloadClosingTemplate();
    } catch {
      showMessage("error", "No se pudo descargar la plantilla");
    }
  };

  const detail = job?.error_detail;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      destroyOnClose
      rootClassName={isDark ? "dark" : undefined}
    >
      <h2 className="text-[18px] font-semibold text-cp-ink">Cargar cierre</h2>
      <p className="mt-1 text-[13px] text-cp-ink-3">
        Sube la cartera y los pagos al cierre tal como salen del ERP, en la plantilla. Al
        publicarse, el cierre queda fijo: no cambia aunque luego se apliquen pagos en Cashport.
      </p>

      {!job && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[13px] font-medium text-cp-ink">Cierre de</span>
            <Select
              value={period}
              onChange={setPeriod}
              className="min-w-[200px]"
              options={months.map((m) => ({
                value: m,
                label: loadedPeriods.includes(m)
                  ? `${periodLabel(m)} · ya cargado`
                  : periodLabel(m),
                disabled: loadedPeriods.includes(m)
              }))}
            />
          </div>

          <Upload.Dragger
            accept=".xlsx"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(f) => {
              setFile(f);
              return false;
            }}
            className="mt-4 block"
          >
            <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
              <UploadSimple size={26} className="text-cp-ink-3" />
              {file ? (
                <p className="text-[13.5px] font-semibold text-cp-ink">{file.name}</p>
              ) : (
                <p className="text-[13.5px] font-semibold text-cp-ink">
                  Arrastra aquí el Excel del cierre o haz clic para elegirlo
                </p>
              )}
              <p className="text-[13px] text-cp-ink-3">
                .xlsx con las hojas Cartera y Pagos · los NIT que no existan en Clientes quedan como
                pendientes por crear
              </p>
            </div>
          </Upload.Dragger>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={template}
              className="flex h-10 items-center gap-2 text-[14px] font-semibold text-cp-ink"
            >
              <FileXls size={18} /> Descargar plantilla
            </button>
            <button
              type="button"
              disabled={!file || sending}
              onClick={submit}
              className="h-10 rounded-[10px] bg-cp-lime px-5 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark disabled:opacity-50"
            >
              {sending ? "Enviando…" : "Cargar cierre"}
            </button>
          </div>
        </>
      )}

      {job && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl bg-cp-bg px-4 py-3">
            {job.status === "PROCESSING" && (
              <span className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#f5b700]" />
            )}
            {job.status === "READY" && (
              <CheckCircle size={20} weight="fill" className="shrink-0 text-cp-lime-dark" />
            )}
            {job.status === "FAILED" && (
              <WarningCircle
                size={20}
                weight="fill"
                className="shrink-0 text-[#d11a2a] dark:text-[#ff6b6b]"
              />
            )}
            <div className="min-w-0 text-[13px]">
              <p className="font-semibold text-cp-ink">
                {job.status === "PROCESSING" &&
                  `Procesando el cierre de ${periodLabel(job.period).toLowerCase()}…`}
                {job.status === "READY" &&
                  `Cierre de ${periodLabel(job.period).toLowerCase()} cargado`}
                {job.status === "FAILED" && "No se cargó el cierre"}
              </p>
              <p className="text-cp-ink-3">
                {job.status === "PROCESSING" &&
                  "Validamos columnas, periodo y cruzamos cada NIT con Clientes. Puede tardar un par de minutos con archivos grandes."}
                {job.status === "READY" &&
                  `${job.document_rows.toLocaleString("es-CO")} documentos por ${formatAmount(job.portfolio_amount)} · ${job.payment_rows.toLocaleString("es-CO")} pagos por ${formatAmount(job.payment_amount)}`}
                {job.status === "FAILED" && job.error_message}
              </p>
            </div>
          </div>

          {detail?.warnings?.length ? (
            <ul className="list-disc pl-5 text-[13px] text-cp-ink-2">
              {detail.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}

          {detail?.missing_clients?.length ? (
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-cp-ink">
                  NIT pendientes por crear en Clientes (
                  {detail.missing_clients.length.toLocaleString("es-CO")})
                </p>
                <button
                  type="button"
                  onClick={() => downloadPendingClients(detail.missing_clients, job.period)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-cp-ink hover:underline"
                >
                  <DownloadSimple size={14} weight="bold" /> Descargar
                </button>
              </div>
              <div className="max-h-[220px] overflow-y-auto rounded-lg border border-cp-line">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-cp-surface">
                    <tr className="[&>th]:border-b [&>th]:border-cp-line [&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold">
                      <th className="text-left">NIT</th>
                      <th className="text-right">Filas</th>
                      <th className="text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.missing_clients.map((m) => (
                      <tr
                        key={m.nit}
                        className="[&>td]:border-b [&>td]:border-cp-line [&>td]:px-3 [&>td]:py-1.5"
                      >
                        <td>{m.nit}</td>
                        <td className="text-right">{m.rows.toLocaleString("es-CO")}</td>
                        <td className="text-right tabular-nums">{formatAmount(m.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {detail?.errors?.length ? (
            <div>
              <p className="mb-1 text-[13px] font-semibold text-cp-ink">
                Errores del archivo
                {detail.error_count > detail.errors.length &&
                  ` (primeros ${detail.errors.length} de ${detail.error_count.toLocaleString("es-CO")})`}
              </p>
              <div className="max-h-[220px] overflow-y-auto rounded-lg border border-cp-line">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-cp-surface">
                    <tr className="[&>th]:border-b [&>th]:border-cp-line [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
                      <th>Hoja</th>
                      <th>Fila</th>
                      <th>Columna</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.errors.map((e, i) => (
                      <tr
                        key={i}
                        className="align-top [&>td]:border-b [&>td]:border-cp-line [&>td]:px-3 [&>td]:py-1.5"
                      >
                        <td>{e.sheet}</td>
                        <td>{e.row ?? "—"}</td>
                        <td>{e.column ?? "—"}</td>
                        <td className="text-cp-ink-2">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            {job.status === "FAILED" && (
              <button
                type="button"
                onClick={() => {
                  setJob(null);
                  setFile(null);
                }}
                className="h-10 px-4 text-[14px] font-semibold text-cp-ink"
              >
                Cargar otro archivo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-[10px] bg-cp-lime px-5 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
            >
              {job.status === "PROCESSING" ? "Seguir en segundo plano" : "Cerrar"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
