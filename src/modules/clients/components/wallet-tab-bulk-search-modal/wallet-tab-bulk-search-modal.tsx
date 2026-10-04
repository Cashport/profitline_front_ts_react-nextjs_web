import { useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, Modal, Steps } from "antd";
import { Check, X } from "phosphor-react";

import { cn, formatNumber } from "@/utils/utils";
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
  classifyIds
} from "./bulk-search-mock-data";
import { MAX_BULK_IDS, parseIds } from "./bulk-search-utils";
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
  clientName?: string;
}

const STEP_TITLES = ["Cargar", "Resultados", "Acción"];

// Duración simulada de la búsqueda y de la acción
const MOCK_PROCESS_MS = 2400;

const INITIAL_ACTION_CONFIG: IBulkActionConfig = {
  scope: { Saldo: true, Pagada: false, Novedad: true, "Facturado mes actual": true },
  action: "estado",
  newStatus: MOCK_NEW_STATUSES[0],
  paymentId: MOCK_PAYMENTS[0].id,
  order: "antiguedad",
  noveltyType: MOCK_NOVELTY_TYPES[0],
  comment: ""
};

const WalletTabBulkSearchModal = ({ isOpen, onClose, clientName }: Props) => {
  const [step, setStep] = useState<BulkSearchStep>("input");
  const [busyKind, setBusyKind] = useState<BulkBusyKind>("search");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [file, setFile] = useState<IBulkSearchFile | null>(null);
  const [rows, setRows] = useState<IBulkSearchRow[]>([]);
  const [resultTab, setResultTab] = useState<BulkResultKind>("found");
  const [resultQuery, setResultQuery] = useState("");
  const [actionConfig, setActionConfig] = useState<IBulkActionConfig>(INITIAL_ACTION_CONFIG);
  const [doneSummary, setDoneSummary] = useState<IBulkDoneSummary>({ ok: 0, errors: 0 });

  const inputIds = useMemo(() => (file ? file.ids : parseIds(text)), [file, text]);
  const foundRows = useMemo(() => rows.filter((row) => row.result === "found"), [rows]);
  const scopedRows = useMemo(
    () => foundRows.filter((row) => row.status && actionConfig.scope[row.status]),
    [foundRows, actionConfig.scope]
  );
  const selectedAction =
    BULK_ACTIONS.find((item) => item.key === actionConfig.action) ?? BULK_ACTIONS[0];

  // Progreso simulado: al llegar al 100 % pasa a los resultados o al resumen de la acción
  useEffect(() => {
    if (step !== "busy") return;

    const startedAt = Date.now();
    let finishTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      const value = Math.min(100, ((Date.now() - startedAt) / MOCK_PROCESS_MS) * 100);
      setProgress(value);
      if (value < 100) return;

      clearInterval(interval);
      finishTimeout = setTimeout(() => {
        if (busyKind === "search") {
          setResultTab("found");
          setResultQuery("");
          setStep("results");
        } else {
          setStep("done");
        }
      }, 250);
    }, 60);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [step, busyKind]);

  const startProcess = (kind: BulkBusyKind) => {
    setBusyKind(kind);
    setProgress(0);
    setStep("busy");
  };

  const handleSearch = () => {
    if (!inputIds.length || inputIds.length > MAX_BULK_IDS) return;
    setRows(classifyIds(inputIds));
    startProcess("search");
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
    if (step === "busy" || step === "done") setStep("input");
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
          `Subiendo ${formatNumber(rows.length)} registros`,
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
              <p className="truncate text-xs text-muted-foreground">
                {clientName ? `${clientName} · ` : ""}hasta {formatNumber(MAX_BULK_IDS)} facturas
                por búsqueda
              </p>
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
            />
          )}

          {step === "results" && (
            <BulkSearchResultsStep
              rows={rows}
              tab={resultTab}
              query={resultQuery}
              clientName={clientName}
              onTabChange={setResultTab}
              onQueryChange={setResultQuery}
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
  );
};

export default WalletTabBulkSearchModal;
