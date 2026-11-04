import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";
import { IMedicalAccountEditForm } from "../../types/IMedicalAccount";
import { useTranslations } from "use-intl";

import {
  DOCUMENT_TYPE_CODES,
  SERVICE_TYPE_CODES,
  isDocumentTypeCode,
  isServiceTypeCode
} from "../../constants";
import { formatDate } from "../../utils/format";

interface MedicalAccountInfoPanelProps {
  account: IMedicalAccountUploadData;
  // Dormant edit mode — see the TODO in MedicalAccountDetailView. Optional so the
  // panel renders read-only by default; re-enable by passing all three again.
  editing?: boolean;
  form?: IMedicalAccountEditForm;
  onChange?: (patch: Partial<IMedicalAccountEditForm>) => void;
}

const inputCls =
  "w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors";

const Field = ({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="min-w-0">
    <p className="mb-1 text-[13px] font-medium text-gray-400">{label}</p>
    <p
      className={`text-sm font-medium leading-tight text-gray-800 ${mono ? "font-mono font-normal" : ""}`}
    >
      {value}
    </p>
  </div>
);

const EditField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="mb-1 text-[13px] font-medium text-gray-400">{label}</p>
    {children}
  </div>
);

export function MedicalAccountInfoPanel({
  account,
  editing,
  form,
  onChange
}: MedicalAccountInfoPanelProps) {
  const t = useTranslations("medicalAccounts");
  const tCommon = useTranslations("common");

  const withLabel = (code: string, label: string) => `${code} — ${label}`;
  const serviceLabel = !account.service_type
    ? "-"
    : isServiceTypeCode(account.service_type)
      ? withLabel(account.service_type, t(`serviceTypes.${account.service_type}`))
      : account.service_type;
  const documentTypeLabel = !account.document_type
    ? "-"
    : isDocumentTypeCode(account.document_type)
      ? withLabel(account.document_type, t(`documentTypes.${account.document_type}`))
      : account.document_type;

  return (
    <div className="flex items-stretch gap-6 px-6 py-5">
      {/* Patient info — fixed ~35% */}
      <div className="flex w-[35%] shrink-0 flex-col justify-between gap-4">
        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
            {editing && form && onChange ? (
              <EditField label={tCommon("fields.name")}>
                <input
                  value={form.nombrePaciente}
                  onChange={(e) => onChange({ nombrePaciente: e.target.value })}
                  className={inputCls}
                  placeholder={t("info.patientNamePlaceholder")}
                />
              </EditField>
            ) : (
              <Field label={tCommon("fields.name")} value={account.patient_name ?? "-"} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {editing && form && onChange ? (
              <EditField label={t("info.documentType")}>
                <select
                  value={form.tipoDocumento}
                  onChange={(e) => onChange({ tipoDocumento: e.target.value })}
                  className={inputCls}
                >
                  <option value="">{tCommon("actions.select")}</option>
                  {DOCUMENT_TYPE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {withLabel(code, t(`documentTypes.${code}`))}
                    </option>
                  ))}
                </select>
              </EditField>
            ) : (
              <Field label={t("info.documentType")} value={documentTypeLabel} />
            )}
          </div>
        </div>

        <div>
          {editing && form && onChange ? (
            <EditField label={t("info.documentNumber")}>
              <input
                value={form.documentoPaciente}
                onChange={(e) => onChange({ documentoPaciente: e.target.value })}
                className={inputCls}
                placeholder="-"
              />
            </EditField>
          ) : (
            <Field label={t("info.documentNumber")} value={account.document_number ?? "-"} mono />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px shrink-0 self-stretch bg-gray-100" />

      {/* Authorization / service info — remaining space */}
      <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/50 p-5">
        <div className="grid grid-cols-5 gap-x-6 gap-y-4">
          {editing && form && onChange ? (
            <>
              <EditField label={t("info.authorizationNumber")}>
                <input
                  value={form.idAutorizacion}
                  onChange={(e) => onChange({ idAutorizacion: e.target.value })}
                  className={inputCls}
                  placeholder="-"
                />
              </EditField>
              <EditField label={t("info.regimen")}>
                <select
                  value={form.regimen}
                  onChange={(e) =>
                    onChange({ regimen: e.target.value as IMedicalAccountEditForm["regimen"] })
                  }
                  className={inputCls}
                >
                  <option value="">{tCommon("actions.select")}</option>
                  <option value="Contributivo">{t("regimens.contributivo")}</option>
                  <option value="Subsidiado">{t("regimens.subsidiado")}</option>
                </select>
              </EditField>
              <EditField label={t("info.serviceDate")}>
                <input
                  type="date"
                  value={form.fechaServicio}
                  onChange={(e) => onChange({ fechaServicio: e.target.value })}
                  className={inputCls}
                />
              </EditField>
              <EditField label={t("info.serviceType")}>
                <select
                  value={form.tipoServicio}
                  onChange={(e) => onChange({ tipoServicio: e.target.value })}
                  className={inputCls}
                >
                  <option value="">{tCommon("actions.select")}</option>
                  {SERVICE_TYPE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {withLabel(code, t(`serviceTypes.${code}`))}
                    </option>
                  ))}
                </select>
              </EditField>
              <EditField label={t("info.eps")}>
                <input
                  value={form.eps}
                  onChange={(e) => onChange({ eps: e.target.value })}
                  className={inputCls}
                  placeholder="-"
                />
              </EditField>
              <Field label={t("info.uploadDate")} value={formatDate(account.created_at)} />
            </>
          ) : (
            <>
              <Field
                label={t("info.authorizationNumber")}
                value={account.authorization_number ?? "-"}
                mono
              />
              <Field label={t("info.orderNumber")} value={account.order_number ?? "-"} mono />
              <Field label={t("info.regimen")} value={account.regimen ?? "-"} />
              <Field label={t("info.serviceDate")} value={formatDate(account.service_date)} />
              <Field label={t("info.serviceType")} value={serviceLabel} />
              <Field label={t("info.eps")} value={account.eps ?? "-"} />
              <Field label={t("info.uploadDate")} value={formatDate(account.created_at)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
