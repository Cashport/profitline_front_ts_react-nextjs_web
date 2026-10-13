import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button, ConfigProvider, Modal, Steps, message } from "antd";
import { Check, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import {
  downloadInvoicesBulkSearch,
  searchInvoicesBulk
} from "@/services/invoices/invoiceBulkSearch";
import { getDigitalRecordFormInfo } from "@/services/accountingAdjustment/accountingAdjustment";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { IInvoiceBulkSearchSummary, InvoiceBulkSearchInput } from "@/types/invoices/IInvoices";
import BulkSearchActionStep from "./bulk-search-action-step";
import BulkSearchDoneStep from "./bulk-search-done-step";
import BulkSearchInputStep from "./bulk-search-input-step";
import BulkSearchProgress from "./bulk-search-progress";
import BulkSearchResultsStep from "./bulk-search-results-step";
import { hasActiveIncidents, runBulkAction } from "./bulk-search-actions";
import { BULK_ACTIONS, PAID_STATUS } from "./bulk-search-constants";
import { parseIds, toBulkSearchRows } from "./bulk-search-utils";
import {
  BulkActionKey,
  BulkBusyKind,
  BulkResultKind,
  BulkSearchStep,
  IBulkActionConfig,
  IBulkSearchFile,
  IBulkSearchRow
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientUUID: string;
  clientName?: string;
  /** Al terminar una acción, para refrescar lo que cambió. */
  onActionDone?: (action: BulkActionKey) => void;
}

const STEP_TITLES = ["Cargar", "Resultados", "Acción"];

// Ni la búsqueda ni las acciones informan su avance: la barra se acerca a este valor y el 100 %
// llega con la respuesta
const PROGRESS_CAP = 90;

const INITIAL_ACTION_CONFIG: IBulkActionConfig = {
  // Se arma con los estados encontrados al terminar cada búsqueda
  scope: {},
  action: "estado",
  noveltyAmount: null,
  radicationDate: null,
  evidence: [],
  comment: "",
  statementMethod: "correo",
  recipients: []
};

const getErrorMessage = (error: unknown, fallback: string) => {
  // `instance` (p. ej. al llevar facturas a la tabla de aplicación) no traduce el error del backend
  if (axios.isAxiosError(error)) return error.response?.data?.message || fallback;
  return error instanceof Error && error.message ? error.message : fallback;
};

const WalletTabBulkSearchModal = ({
  isOpen,
  onClose,
  clientUUID,
  clientName,
  onActionDone
}: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
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
  // Resumen de la acción: llega con su respuesta
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  // Registrar novedad: alguna factura ya tiene una novedad abierta
  const [isIncidentConflict, setIsIncidentConflict] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  // Cambia al cerrar: la respuesta de una acción lanzada antes ya no toca el modal
  const actionRunRef = useRef(0);
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

  // Contactos y archivos del estado de cuenta: sólo se piden si se elige esa acción
  const statement = useSWR(
    actionConfig.action === "estado_cta"
      ? ["bulk-search-digital-record", projectId, clientUUID]
      : null,
    () => getDigitalRecordFormInfo(projectId, clientUUID),
    { revalidateOnFocus: false }
  );

  // Mientras el proceso responde la barra avanza hacia el tope; con la respuesta se completa
  // y pasa a los resultados o al resumen de la acción
  useEffect(() => {
    if (step !== "busy") return;

    const isFinished = busyKind === "search" ? !!summary : doneMessage !== null;
    if (isFinished) {
      setProgress(100);
      const finishTimeout = setTimeout(() => {
        if (busyKind === "action") {
          setStep("done");
          return;
        }
        setResultTab("found");
        setResultQuery("");
        setStep("results");
      }, 250);
      return () => clearTimeout(finishTimeout);
    }

    const interval = setInterval(
      () => setProgress((prev) => prev + (PROGRESS_CAP - prev) * 0.03),
      60
    );
    return () => clearInterval(interval);
  }, [step, busyKind, summary, doneMessage]);

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

  const handleRunAction = async (createNewIncident = false) => {
    const runId = actionRunRef.current;
    const config = actionConfig;
    const invoiceIds = scopedRows.flatMap((row) => row.invoiceId ?? []);
    setDoneMessage(null);
    startProcess("action");

    try {
      const result = await runBulkAction({
        config,
        invoiceIds,
        contacts: statement.data?.usuarios ?? [],
        clientUUID,
        projectId,
        createNewIncident
      });
      // También avisa si el modal se cerró mientras tanto
      messageApi.success(result);
      onActionDone?.(config.action);
      if (runId !== actionRunRef.current) return;

      setDoneMessage(result);
      // Se limpia el formulario para que "Otra acción" no repita la misma por error
      setActionConfig((prev) => ({
        ...INITIAL_ACTION_CONFIG,
        scope: prev.scope,
        action: prev.action,
        statementMethod: prev.statementMethod
      }));
    } catch (error) {
      const isCurrentRun = runId === actionRunRef.current;
      if (isCurrentRun) setStep("action");
      // Con el modal abierto se ofrece crear la novedad igual; si se cerró, sólo se avisa
      if (
        isCurrentRun &&
        config.action === "novedad" &&
        !createNewIncident &&
        hasActiveIncidents(error)
      ) {
        setIsIncidentConflict(true);
        return;
      }
      messageApi.error(getErrorMessage(error, `No se pudo ${selectedAction.label.toLowerCase()}.`));
    }
  };

  const handleClose = () => {
    // La búsqueda en curso se cancela; una acción sigue en el servidor y sólo avisa al terminar
    searchAbortRef.current?.abort();
    actionRunRef.current++;
    onClose();
  };

  // Cada apertura empieza de cero. Se limpia al terminar de cerrarse, para no ver el cambio de
  // paso durante la animación
  const resetModal = () => {
    setStep("input");
    setText("");
    setFile(null);
    setSearchInput(null);
    setRows([]);
    setSummary(null);
    setActionConfig(INITIAL_ACTION_CONFIG);
    setDoneMessage(null);
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

  // El estado de cuenta es del cliente: su progreso no habla de facturas
  const isStatement = actionConfig.action === "estado_cta";
  const isStatementDownload = actionConfig.statementMethod === "descargar";

  const busyTitle =
    busyKind === "search"
      ? "Buscando facturas"
      : isStatement
        ? `${isStatementDownload ? "Descargando" : "Enviando"} estado de cuenta`
        : `Procesando ${formatNumber(scopedRows.length)} facturas`;

  const busyLabels =
    busyKind === "search"
      ? [
          inputIds ? `Subiendo ${formatNumber(inputIds.length)} registros` : `Subiendo ${file?.name}`,
          "Cargando tabla temporal",
          "Cruzando con la cartera del cliente",
          "Preparando resultados"
        ]
      : isStatement
        ? [
            "Generando estado de cuenta",
            isStatementDownload ? "Preparando archivos" : "Enviando a los destinatarios"
          ]
        : [
            "Validando facturas",
            `Aplicando ${selectedAction.label.toLowerCase()}`,
            "Registrando en historial"
          ];

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={handleClose}
        afterClose={resetModal}
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
                title={busyTitle}
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
                statementInfo={statement.data}
                isStatementLoading={statement.isLoading}
                hasStatementError={!!statement.error}
                messageApi={messageApi}
                onConfigChange={(patch) => setActionConfig((prev) => ({ ...prev, ...patch }))}
                onBack={() => setStep("results")}
                onRun={() => handleRunAction()}
              />
            )}

            {step === "done" && doneMessage !== null && (
              <BulkSearchDoneStep
                action={selectedAction}
                message={doneMessage}
                onAnotherAction={() => setStep("action")}
                onClose={handleClose}
              />
            )}
          </div>
        </ConfigProvider>
      </Modal>
      <ModalConfirmAction
        isOpen={isIncidentConflict}
        onClose={() => setIsIncidentConflict(false)}
        onOk={() => {
          setIsIncidentConflict(false);
          handleRunAction(true);
        }}
        title="Algunas facturas ya tienen novedades abiertas. ¿Qué deseas hacer con las novedades?"
        okText="Crear novedad nueva"
        cancelText="No crear nueva novedad"
      />
    </>
  );
};

export default WalletTabBulkSearchModal;
