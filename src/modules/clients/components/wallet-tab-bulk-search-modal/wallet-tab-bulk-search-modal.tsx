import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ConfigProvider, Modal, Steps, message } from "antd";
import { Check, X } from "phosphor-react";

import { cn, formatNumber } from "@/utils/utils";
import {
  downloadInvoicesBulkSearch,
  searchInvoicesBulk
} from "@/services/invoices/invoiceBulkSearch";
import { IInvoiceBulkSearchSummary, InvoiceBulkSearchInput } from "@/types/invoices/IInvoices";
import BulkSearchActionStep from "./bulk-search-action-step";
import BulkSearchDoneStep from "./bulk-search-done-step";
import BulkSearchInputStep from "./bulk-search-input-step";
import BulkSearchProgress from "./bulk-search-progress";
import BulkSearchResultsStep from "./bulk-search-results-step";
import {
  BULK_ACTIONS,
  MOCK_NEW_STATUSES,
  MOCK_NOVELTY_TYPES,
  MOCK_PAYMENTS,
  PAID_STATUS
} from "./bulk-search-mock-data";
import { parseIds, toBulkSearchRows } from "./bulk-search-utils";
import {
  BulkBusyKind,
  BulkResultKind,
  BulkSearchStep,
  IBulkActionConfig,
  IBulkDoneSummary,
  IBulkSearchFile,
  IBulkSearchRow
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientUUID: string;
  clientName?: string;
}

const STEP_TITLES = ["Cargar", "Resultados", "Acción"];

// Duración simulada de la acción, que todavía no tiene servicio
const MOCK_ACTION_MS = 2400;

// La búsqueda no informa su avance: la barra se acerca a este valor y el 100 % llega con la respuesta
const SEARCH_PROGRESS_CAP = 90;

const INITIAL_ACTION_CONFIG: IBulkActionConfig = {
  // Se arma con los estados encontrados al terminar cada búsqueda
  scope: {},
  action: "estado",
  newStatus: MOCK_NEW_STATUSES[0],
  paymentId: MOCK_PAYMENTS[0].id,
  order: "antiguedad",
  noveltyType: MOCK_NOVELTY_TYPES[0],
  comment: ""
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const WalletTabBulkSearchModal = ({ isOpen, onClose, clientUUID, clientName }: Props) => {
  const [step, setStep] = useState<BulkSearchStep>("input");
  const [busyKind, setBusyKind] = useState<BulkBusyKind>("search");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [file, setFile] = useState<IBulkSearchFile | null>(null);
  // Entrada de la última búsqueda: el Excel de resultados se pide con la misma
  const [searchInput, setSearchInput] = useState<InvoiceBulkSearchInput | null>(null);
  const [rows, setRows] = useState<IBulkSearchRow[]>([]);
  const [summary, setSummary] = useState<IInvoiceBulkSearchSummary | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resultTab, setResultTab] = useState<BulkResultKind>("found");
  const [resultQuery, setResultQuery] = useState("");
  const [actionConfig, setActionConfig] = useState<IBulkActionConfig>(INITIAL_ACTION_CONFIG);
  const [doneSummary, setDoneSummary] = useState<IBulkDoneSummary>({ ok: 0, errors: 0 });
  const searchAbortRef = useRef<AbortController | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Sin definir cuando el archivo es un Excel: lo lee el backend
  const inputIds = useMemo(() => (file ? file.ids : parseIds(text)), [file, text]);
  const foundRows = useMemo(() => rows.filter((row) => row.result === "found"), [rows]);
  const scopedRows = useMemo(
    () => foundRows.filter((row) => row.status && actionConfig.scope[row.status]),
    [foundRows, actionConfig.scope]
  );
  const selectedAction =
    BULK_ACTIONS.find((item) => item.key === actionConfig.action) ?? BULK_ACTIONS[0];

  // Mientras la búsqueda responde la barra avanza hacia el tope; con la respuesta se completa
  // y pasa a los resultados
  useEffect(() => {
    if (step !== "busy" || busyKind !== "search") return;

    if (summary) {
      setProgress(100);
      const finishTimeout = setTimeout(() => {
        setResultTab("found");
        setResultQuery("");
        setStep("results");
      }, 250);
      return () => clearTimeout(finishTimeout);
    }

    const interval = setInterval(
      () => setProgress((prev) => prev + (SEARCH_PROGRESS_CAP - prev) * 0.03),
      60
    );
    return () => clearInterval(interval);
  }, [step, busyKind, summary]);

  // Progreso simulado de la acción: al llegar al 100 % pasa al resumen
  useEffect(() => {
    if (step !== "busy" || busyKind !== "action") return;

    const startedAt = Date.now();
    let finishTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      const value = Math.min(100, ((Date.now() - startedAt) / MOCK_ACTION_MS) * 100);
      setProgress(value);
      if (value < 100) return;

      clearInterval(interval);
      finishTimeout = setTimeout(() => setStep("done"), 250);
    }, 60);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [step, busyKind]);

  // Si el modal se desmonta con una búsqueda en curso, se cancela
  useEffect(() => () => searchAbortRef.current?.abort(), []);

  const startProcess = (kind: BulkBusyKind) => {
    setBusyKind(kind);
    setProgress(0);
    setStep("busy");
  };

  const handleSearch = async () => {
    if (!file && !inputIds?.length) return;
    if (!clientUUID) {
      messageApi.warning("Todavía se están cargando los datos del cliente.");
      return;
    }

    const input: InvoiceBulkSearchInput = file ? { file: file.file } : { ids: inputIds ?? [] };
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchInput(input);
    setSummary(null);
    startProcess("search");

    try {
      const data = await searchInvoicesBulk(clientUUID, input, controller.signal);
      const nextRows = toBulkSearchRows(data);

      // Por defecto la acción aplica a todos los estados encontrados menos Pagada
      const scope: Record<string, boolean> = {};
      nextRows.forEach((row) => {
        if (row.status) scope[row.status] = row.status !== PAID_STATUS;
      });

      setRows(nextRows);
      setActionConfig((prev) => ({ ...prev, scope }));
      setSummary(data.summary);
    } catch (error) {
      // Cancelada al cerrar el modal
      if (controller.signal.aborted) return;
      messageApi.error(getErrorMessage(error, "No se pudo hacer la búsqueda masiva."));
      setStep("input");
    }
  };

  const handleDownload = async () => {
    if (!searchInput) return;

    setIsDownloading(true);
    try {
      await downloadInvoicesBulkSearch(clientUUID, searchInput);
    } catch (error) {
      messageApi.error(getErrorMessage(error, "No se pudo descargar el Excel de resultados."));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRunAction = (count: number) => {
    // Mock: alrededor del 0,4 % de las facturas falla
    const errors = Math.round(count * 0.004);
    setDoneSummary({ ok: count - errors, errors });
    startProcess("action");
  };

  const handleClose = () => {
    // Cerrar a mitad de un proceso lo cancela; después de terminar se vuelve a empezar en Cargar.
    // En los demás pasos se conserva todo para retomar donde se dejó.
    if (step === "busy" || step === "done") {
      searchAbortRef.current?.abort();
      setStep("input");
    }
    onClose();
  };

  const stepIndex =
    step === "input" || (step === "busy" && busyKind === "search") ? 0 : step === "results" ? 1 : 2;

  const stepItems = STEP_TITLES.map((title, index) => {
    const isReached = index <= stepIndex;
    return {
      // Cada paso mide lo que su contenido, así todas las líneas entre pasos quedan iguales
      className: index < STEP_TITLES.length - 1 ? "!flex-none pe-[18px]" : undefined,
      title: (
        <span
          className={cn(
            "text-xs",
            index === stepIndex ? "font-semibold" : "font-medium",
            isReached ? "text-foreground" : "text-[#8a8a8a]"
          )}
        >
          {title}
        </span>
      ),
      icon: (
        <span
          className={cn(
            "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full align-top text-[11px] font-semibold",
            isReached ? "bg-foreground text-white" : "bg-[#ececec] text-[#8a8a8a]"
          )}
        >
          {index < stepIndex ? <Check size={11} weight="bold" /> : index + 1}
        </span>
      )
    };
  });

  const busyLabels =
    busyKind === "search"
      ? [
          inputIds ? `Subiendo ${formatNumber(inputIds.length)} registros` : `Subiendo ${file?.name}`,
          "Cargando tabla temporal",
          "Cruzando con la cartera del cliente",
          "Preparando resultados"
        ]
      : [
          "Validando facturas",
          `Aplicando ${selectedAction.label.toLowerCase()}`,
          "Registrando en historial",
          "Generando reporte"
        ];

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        closeIcon={null}
        centered
        maskClosable={false}
        width="min(960px, calc(100vw - 32px))"
        styles={{
          body: { padding: 0 },
          content: { padding: 0, overflow: "hidden", borderRadius: 12 }
        }}
      >
        {/* El tema global deja los placeholders en negro (se confunden con IDs ya pegados) y
            colorTextSecondary en blanco, que Segmented usa para las opciones no elegidas */}
        <ConfigProvider
          theme={{
            token: { colorTextPlaceholder: "#9a9a9a" },
            components: { Segmented: { itemColor: "#6b6b6b", trackBg: "#ececec" } }
          }}
        >
          <div className="flex h-[min(720px,calc(100vh-64px))] flex-col text-foreground">
            <header className="flex flex-none flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#ececec] px-[22px] py-4">
              <div className="mr-auto min-w-0 max-w-full">
                <h3 className="text-base font-semibold">Búsqueda masiva</h3>
                {clientName && (
                  <p className="truncate text-xs text-muted-foreground">{clientName}</p>
                )}
              </div>
              {/* Con iconos propios, colorPrimary sólo pinta la línea tras los pasos terminados */}
              <ConfigProvider
                theme={{ components: { Steps: { colorPrimary: "#d6d6d6", colorSplit: "#d6d6d6" } } }}
              >
                <Steps
                  size="small"
                  responsive={false}
                  current={stepIndex}
                  items={stepItems}
                  className="!w-auto max-w-full"
                />
              </ConfigProvider>
              <Button type="text" aria-label="Cerrar" icon={<X size={14} />} onClick={handleClose} />
            </header>

            {step === "input" && (
              <BulkSearchInputStep
                text={text}
                file={file}
                ids={inputIds}
                onTextChange={setText}
                onFileChange={setFile}
                onCancel={handleClose}
                onSearch={handleSearch}
              />
            )}

            {step === "busy" && (
              <BulkSearchProgress
                title={
                  busyKind === "search"
                    ? "Buscando facturas"
                    : `Procesando ${formatNumber(scopedRows.length)} facturas`
                }
                progress={progress}
                stepLabels={busyLabels}
                footnote={
                  busyKind === "search"
                    ? "Si cierras esta ventana se cancela la búsqueda."
                    : "Puedes cerrar esta ventana; te avisaremos cuando termine."
                }
              />
            )}

            {step === "results" && summary && (
              <BulkSearchResultsStep
                rows={rows}
                summary={summary}
                tab={resultTab}
                query={resultQuery}
                isDownloading={isDownloading}
                onTabChange={setResultTab}
                onQueryChange={setResultQuery}
                onDownload={handleDownload}
                onRestart={() => setStep("input")}
                onContinue={() => setStep("action")}
              />
            )}

            {step === "action" && (
              <BulkSearchActionStep
                foundRows={foundRows}
                scopedRows={scopedRows}
                config={actionConfig}
                onConfigChange={(patch) => setActionConfig((prev) => ({ ...prev, ...patch }))}
                onBack={() => setStep("results")}
                onRun={handleRunAction}
              />
            )}

            {step === "done" && (
              <BulkSearchDoneStep
                action={selectedAction}
                summary={doneSummary}
                rows={scopedRows}
                onAnotherAction={() => setStep("action")}
                onClose={handleClose}
              />
            )}
          </div>
        </ConfigProvider>
      </Modal>
    </>
  );
};

export default WalletTabBulkSearchModal;
