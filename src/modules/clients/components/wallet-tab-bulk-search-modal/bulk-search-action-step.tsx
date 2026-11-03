import { ReactNode, useMemo } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Segmented,
  Select,
  Upload
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft, Paperclip, UploadSimple, X } from "phosphor-react";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";
import { DigitalRecordResponse, IUser } from "@/services/accountingAdjustment/accountingAdjustment";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import {
  getInvoiceStateLabelKey,
  invoiceStates
} from "@/modules/clients/components/wallet-tab-change-status-modal/wallet-tab-change-status-modal";
import { BULK_ACTIONS } from "./bulk-search-constants";
import { formatMillions } from "./bulk-search-utils";
import { BulkStatementMethod, IBulkActionConfig, IBulkSearchRow } from "./types";

interface Props {
  foundRows: IBulkSearchRow[];
  /** Encontradas cuyo estado está marcado en "Aplicar a". */
  scopedRows: IBulkSearchRow[];
  config: IBulkActionConfig;
  /** Contactos y archivos del estado de cuenta: sólo llegan con esa acción elegida. */
  statementInfo?: DigitalRecordResponse;
  isStatementLoading: boolean;
  hasStatementError: boolean;
  messageApi: MessageInstance;
  onConfigChange: (patch: Partial<IBulkActionConfig>) => void;
  onBack: () => void;
  onRun: () => void;
}

// Etiquetas en clients.bulkSearch.action.methods
const STATEMENT_METHODS: {
  labelKey: "email" | "whatsapp" | "download";
  value: BulkStatementMethod;
}[] = [
  { labelKey: "email", value: "correo" },
  { labelKey: "whatsapp", value: "whatsapp" },
  { labelKey: "download", value: "descargar" }
];

// "Aplicar pago" sólo lista las primeras facturas
const VISIBLE_INVOICES = 100;

// Mismo límite que ModalAttachEvidence
const MAX_EVIDENCE_MB = 30;

// Miles con punto y decimales con coma, como formatMoney (es-CO)
const formatAmount = (value?: string) => {
  if (!value) return "";
  const [integer, decimal] = value.split(".");
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${decimal ? `,${decimal}` : ""}`;
};

const parseAmount = (value?: string) => (value ?? "").replace(/\./g, "").replace(",", ".");

// Por WhatsApp sólo sirven los teléfonos activos, igual que en AccountStatementModal
const hasActivePhone = (user: IUser) => !!user.full_phone && !user.full_phone.includes("INACTIVE");

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    {children}
  </div>
);

const BulkSearchActionStep = ({
  foundRows,
  scopedRows,
  config,
  statementInfo,
  isStatementLoading,
  hasStatementError,
  messageApi,
  onConfigChange,
  onBack,
  onRun
}: Props) => {
  const t = useTranslations("clients.bulkSearch.action");
  const tActions = useTranslations("clients.bulkSearch.actions");
  const tStates = useTranslations("clients.changeStatus.states");
  const tCommon = useTranslations("common");
  const formatMoney = useAppStore((state) => state.formatMoney);

  // El servicio recibe el estado en minúsculas, igual que desde el modal de cambio de estado
  const statusOptions = useMemo(
    () =>
      invoiceStates.map((state) => {
        const labelKey = getInvoiceStateLabelKey(state);
        return { label: labelKey ? tStates(labelKey) : state, value: state.toLocaleLowerCase() };
      }),
    [tStates]
  );

  const statementMethods = STATEMENT_METHODS.map(({ labelKey, value }) => ({
    label: t(`methods.${labelKey}`),
    value
  }));
  const motives = useInvoiceIncidentMotives();

  // Estados de las encontradas en el orden en que aparecen, con su color y cuántas hay
  const statuses = useMemo(() => {
    const byStatus = new Map<string, { color?: string; count: number }>();
    foundRows.forEach((row) => {
      if (!row.status) return;
      const item = byStatus.get(row.status);
      if (item) item.count++;
      else byStatus.set(row.status, { color: row.statusColor, count: 1 });
    });
    return Array.from(byStatus, ([name, item]) => ({ name, ...item }));
  }, [foundRows]);

  const scopedAmount = useMemo(
    () => scopedRows.reduce((acc, row) => acc + (row.amount ?? 0), 0),
    [scopedRows]
  );

  // Los mismos contactos en correo y WhatsApp: sólo cambia el dato que se envía
  const recipientOptions = useMemo(() => {
    const isWhatsapp = config.statementMethod === "whatsapp";
    return (statementInfo?.usuarios ?? []).map((user) => {
      const isDisabled = isWhatsapp && !hasActivePhone(user);
      const destination = isWhatsapp ? user.full_phone : user.value;
      return {
        value: String(user.contact_id),
        label: `${user.label} · ${isDisabled ? t("noActiveWhatsapp") : destination}`,
        // Lo que muestra la etiqueta una vez elegido
        destination,
        disabled: isDisabled
      };
    });
  }, [statementInfo, config.statementMethod, t]);

  const action = BULK_ACTIONS.find((item) => item.key === config.action) ?? BULK_ACTIONS[0];
  // El estado de cuenta es del cliente: no depende de las facturas elegidas
  const isStatement = config.action === "estado_cta";
  const hasComment =
    config.action === "estado" || config.action === "novedad" || config.action === "radicar";

  // Campos obligatorios de cada acción
  const isIncomplete = {
    estado: !config.newStatus,
    pago: false,
    novedad: !config.motiveId || !config.comment.trim(),
    radicar: !config.radicationDate || !config.evidence.length,
    estado_cta: config.statementMethod !== "descargar" && !config.recipients.length
  }[config.action];
  const isInvalid = (!isStatement && !scopedRows.length) || isIncomplete;

  const runLabel = !isStatement
    ? tActions(`${action.i18nKey}.run`, { count: scopedRows.length })
    : config.statementMethod === "descargar"
      ? t("downloadStatement")
      : t("sendStatement");

  // Dragger lo llama una vez por archivo: el lote entero se agrega con el primero para no
  // perder archivos entre una actualización del estado y otra
  const handleBeforeUploadEvidence = (file: File, fileList: File[]) => {
    if (file === fileList[0]) {
      const accepted = fileList.filter(
        (item) =>
          item.size <= MAX_EVIDENCE_MB * 1024 * 1024 &&
          !config.evidence.some((evidence) => evidence.name === item.name)
      );
      if (accepted.length < fileList.length) {
        messageApi.warning(t("skippedFiles", { maxMb: MAX_EVIDENCE_MB }));
      }
      onConfigChange({ evidence: [...config.evidence, ...accepted] });
    }
    // No se sube aquí: los archivos se envían al radicar
    return Upload.LIST_IGNORE;
  };

  // Como en AccountStatementModal: al pasar a WhatsApp sólo quedan los contactos con teléfono
  // activo (lo escrito a mano era un correo)
  const handleStatementMethodChange = (method: BulkStatementMethod) => {
    const recipients =
      method === "whatsapp"
        ? config.recipients.filter((recipient) => {
            const contact = statementInfo?.usuarios.find(
              (user) => String(user.contact_id) === recipient
            );
            return !!contact && hasActivePhone(contact);
          })
        : config.recipients;
    onConfigChange({ statementMethod: method, recipients });
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-[22px] py-4">
        {!isStatement && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <span className="text-[13px] font-semibold">{t("applyTo")}</span>
              <span className="text-[13px] text-muted-foreground">
                {t("scopeSummary", {
                  count: scopedRows.length,
                  amount: formatMillions(scopedAmount)
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(({ name, color, count }) => (
                <Checkbox
                  key={name}
                  checked={!!config.scope[name]}
                  onChange={(event) =>
                    onConfigChange({ scope: { ...config.scope, [name]: event.target.checked } })
                  }
                  className={cn(
                    "!flex h-[30px] !items-center whitespace-nowrap rounded-md border bg-white !px-2.5 !text-[13px] font-medium",
                    config.scope[name] ? "border-foreground" : "border-[#e3e3e3]"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {name}
                    <span className="text-[#8a8a8a]">{formatNumber(count)}</span>
                  </span>
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">{t("actionTitle")}</span>
            <Radio.Group
              value={config.action}
              onChange={(event) => onConfigChange({ action: event.target.value })}
              className="!flex flex-col gap-1.5"
            >
              {BULK_ACTIONS.map((item) => (
                <Radio
                  key={item.key}
                  value={item.key}
                  className={cn(
                    "!me-0 !flex !items-center rounded-lg border !px-3 !py-2.5",
                    item.key === config.action
                      ? "border-foreground bg-[#fafafa]"
                      : "border-[#ececec] bg-white"
                  )}
                >
                  <span className="block text-[13px] font-medium text-foreground">
                    {tActions(`${item.i18nKey}.label`)}
                  </span>
                  <span className="block text-[13px] text-[#8a8a8a]">
                    {tActions(`${item.i18nKey}.description`)}
                  </span>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-[#f7f7f7] p-3.5">
            {config.action === "estado" && (
              <Field label={t("newStatus")}>
                <Select
                  value={config.newStatus}
                  onChange={(value) => onConfigChange({ newStatus: value })}
                  options={statusOptions}
                  placeholder={t("statusPlaceholder")}
                  style={{ width: "100%" }}
                />
              </Field>
            )}

            {config.action === "pago" &&
              (scopedRows.length ? (
                <Field label={t("paymentTableLabel")}>
                  <ul className="flex max-h-[260px] flex-col overflow-auto rounded-md border border-[#e3e3e3] bg-white">
                    {scopedRows.slice(0, VISIBLE_INVOICES).map((row) => (
                      <li
                        key={row.key}
                        className="flex items-center gap-2 border-b border-[#f0f0f0] px-2.5 py-1.5 text-[13px] last:border-b-0"
                      >
                        <span
                          className="h-1.5 w-1.5 flex-none rounded-full"
                          style={{ backgroundColor: row.statusColor }}
                        />
                        <span className="min-w-0 flex-1 truncate font-mono">{row.id}</span>
                        <span className="whitespace-nowrap font-medium tabular-nums">
                          {formatMoney(row.amount, { hideDecimals: true })}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {scopedRows.length > VISIBLE_INVOICES && (
                    <span className="text-[13px] text-[#8a8a8a]">
                      {t("andMore", { count: scopedRows.length - VISIBLE_INVOICES })}
                    </span>
                  )}
                </Field>
              ) : (
                <p className="text-[13px] text-[#444]">{t("noInvoicesInScope")}</p>
              ))}

            {config.action === "novedad" && (
              <>
                <Field label={tCommon("fields.reason")}>
                  <Select
                    value={config.motiveId}
                    onChange={(value) => onConfigChange({ motiveId: value })}
                    options={motives.data?.map((motive) => ({
                      value: motive.id,
                      label: motive.name,
                      title: motive.description
                    }))}
                    loading={motives.isLoading}
                    status={motives.isError ? "error" : undefined}
                    placeholder={motives.isError ? t("reasonsError") : t("reasonPlaceholder")}
                    showSearch
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                  />
                </Field>
                <Field label={t("disputeAmount")}>
                  <InputNumber<string>
                    stringMode
                    min="0"
                    controls={false}
                    value={config.noveltyAmount}
                    onChange={(value) => onConfigChange({ noveltyAmount: value })}
                    // Mientras se escribe se respeta lo tecleado; al salir se agrupan los miles
                    formatter={(value, { userTyping, input }) =>
                      userTyping ? input : formatAmount(value)
                    }
                    parser={parseAmount}
                    placeholder={t("amountPlaceholder")}
                    style={{ width: "100%" }}
                  />
                </Field>
              </>
            )}

            {config.action === "radicar" && (
              <>
                <Field label={t("submissionType")}>
                  <Input value={t("methods.emailValue")} disabled />
                </Field>
                <Field label={t("submissionDate")}>
                  <DatePicker
                    value={config.radicationDate}
                    onChange={(date) => onConfigChange({ radicationDate: date })}
                    format="DD/MM/YYYY"
                    placeholder={t("datePlaceholder")}
                    style={{ width: "100%" }}
                  />
                </Field>
                <Field label={t("evidence")}>
                  <Upload.Dragger
                    multiple
                    accept={FILE_EXTENSIONS.join(", ")}
                    showUploadList={false}
                    beforeUpload={handleBeforeUploadEvidence}
                  >
                    <div className="flex flex-col items-center gap-1 px-3">
                      <UploadSimple size={18} />
                      <span className="text-[13px] font-medium">{t("dragFiles")}</span>
                      <span className="text-[13px] text-[#8a8a8a]">
                        {t("maxPerFile", { maxMb: MAX_EVIDENCE_MB })}
                      </span>
                    </div>
                  </Upload.Dragger>
                  {config.evidence.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-md border border-[#e3e3e3] bg-white py-1 pe-1 ps-2.5"
                    >
                      <Paperclip size={12} className="flex-none text-[#8a8a8a]" />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{file.name}</span>
                      <Button
                        type="text"
                        size="small"
                        aria-label={t("removeFile", { name: file.name })}
                        icon={<X size={12} />}
                        onClick={() =>
                          onConfigChange({
                            evidence: config.evidence.filter((item) => item !== file)
                          })
                        }
                      />
                    </div>
                  ))}
                </Field>
              </>
            )}

            {isStatement && (
              <>
                <Segmented<BulkStatementMethod>
                  block
                  options={statementMethods}
                  value={config.statementMethod}
                  onChange={handleStatementMethodChange}
                />
                {config.statementMethod === "descargar" ? (
                  <Field label={t("files")}>
                    {isStatementLoading ? (
                      <span className="text-[13px] text-[#8a8a8a]">
                        {tCommon("status.loading")}
                      </span>
                    ) : statementInfo?.attachments.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {statementInfo.attachments.map((file) => (
                          <span
                            key={file.id}
                            className="rounded-md border border-[#e3e3e3] bg-white px-2.5 py-1 text-[13px]"
                          >
                            {file.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[13px] text-[#8a8a8a]">{t("noAttachments")}</span>
                    )}
                  </Field>
                ) : (
                  <Field label={t("to")}>
                    <Select
                      mode="tags"
                      value={config.recipients}
                      onChange={(value: string[]) => onConfigChange({ recipients: value })}
                      options={recipientOptions}
                      loading={isStatementLoading}
                      // Se busca por nombre o destino; lo elegido muestra sólo el correo o el
                      // teléfono
                      optionFilterProp="label"
                      optionLabelProp="destination"
                      placeholder={t("recipientsPlaceholder")}
                      style={{ width: "100%" }}
                    />
                  </Field>
                )}
                {hasStatementError && (
                  <p className="text-[13px] text-[#c4321c]">{t("statementError")}</p>
                )}
              </>
            )}

            {hasComment && (
              <Field
                label={
                  config.action === "novedad" ? tCommon("fields.comment") : t("commentOptional")
                }
              >
                <Input.TextArea
                  value={config.comment}
                  onChange={(event) => onConfigChange({ comment: event.target.value })}
                  placeholder={t("commentPlaceholder")}
                  rows={3}
                  className="!text-[13px]"
                  style={{ resize: "none" }}
                />
              </Field>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-none items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
        <Button type="text" size="large" icon={<CaretLeft size={12} />} onClick={onBack}>
          {t("backToResults")}
        </Button>
        <div className="flex-1" />
        <Button
          type="primary"
          size="large"
          disabled={isInvalid}
          onClick={onRun}
          className="!font-semibold"
        >
          {runLabel}
        </Button>
      </footer>
    </>
  );
};

export default BulkSearchActionStep;
