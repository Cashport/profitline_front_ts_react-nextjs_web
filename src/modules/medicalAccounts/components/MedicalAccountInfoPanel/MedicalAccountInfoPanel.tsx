import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";
import { IMedicalAccountEditForm } from "../../types/IMedicalAccount";
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_OPTIONS
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

const Field = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="min-w-0">
    <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
    <p
      className={`text-sm font-medium leading-tight text-gray-800 ${mono ? "font-mono font-normal" : ""}`}
    >
      {value}
    </p>
  </div>
);

const EditField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
    {children}
  </div>
);

const withLabel = (code: string | null | undefined, labels: Record<string, string>) => {
  if (!code) return "-";
  return labels[code] ? `${code} — ${labels[code]}` : code;
};

export function MedicalAccountInfoPanel({
  account,
  editing,
  form,
  onChange
}: MedicalAccountInfoPanelProps) {
  const serviceLabel = withLabel(account.service_type, SERVICE_TYPE_LABELS);

  return (
    <div className="flex items-stretch gap-6 px-6 py-5">
      {/* Patient info — fixed ~35% */}
      <div className="flex w-[35%] shrink-0 flex-col justify-between gap-4">
        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
            {editing && form && onChange ? (
              <EditField label="Nombre">
                <input
                  value={form.nombrePaciente}
                  onChange={(e) => onChange({ nombrePaciente: e.target.value })}
                  className={inputCls}
                  placeholder="Nombre del paciente"
                />
              </EditField>
            ) : (
              <Field label="Nombre" value={account.patient_name ?? "-"} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {editing && form && onChange ? (
              <EditField label="Tipo de documento">
                <select
                  value={form.tipoDocumento}
                  onChange={(e) => onChange({ tipoDocumento: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar</option>
                  {TIPO_DOCUMENTO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </EditField>
            ) : (
              <Field
                label="Tipo de documento"
                value={withLabel(account.document_type, TIPO_DOCUMENTO_LABELS)}
              />
            )}
          </div>
        </div>

        <div>
          {editing && form && onChange ? (
            <EditField label="No. Documento">
              <input
                value={form.documentoPaciente}
                onChange={(e) => onChange({ documentoPaciente: e.target.value })}
                className={inputCls}
                placeholder="-"
              />
            </EditField>
          ) : (
            <Field label="No. Documento" value={account.document_number ?? "-"} mono />
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
              <EditField label="No. Autorización">
                <input
                  value={form.idAutorizacion}
                  onChange={(e) => onChange({ idAutorizacion: e.target.value })}
                  className={inputCls}
                  placeholder="-"
                />
              </EditField>
              <EditField label="Régimen">
                <select
                  value={form.regimen}
                  onChange={(e) =>
                    onChange({ regimen: e.target.value as IMedicalAccountEditForm["regimen"] })
                  }
                  className={inputCls}
                >
                  <option value="">Seleccionar</option>
                  <option value="Contributivo">Contributivo</option>
                  <option value="Subsidiado">Subsidiado</option>
                </select>
              </EditField>
              <EditField label="Fecha de servicio">
                <input
                  type="date"
                  value={form.fechaServicio}
                  onChange={(e) => onChange({ fechaServicio: e.target.value })}
                  className={inputCls}
                />
              </EditField>
              <EditField label="Tipo de servicio">
                <select
                  value={form.tipoServicio}
                  onChange={(e) => onChange({ tipoServicio: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar</option>
                  {SERVICE_TYPES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {code} — {label}
                    </option>
                  ))}
                </select>
              </EditField>
              <Field label="Fecha de cargue" value={formatDate(account.created_at)} />
            </>
          ) : (
            <>
              <Field label="No. Autorización" value={account.authorization_number ?? "-"} mono />
              {/* Régimen has no source in the API response — shown as "-" for now. */}
              <Field label="Régimen" value="-" />
              <Field label="Fecha de servicio" value={formatDate(account.service_date)} />
              <Field label="Tipo de servicio" value={serviceLabel} />
              <Field label="Fecha de cargue" value={formatDate(account.created_at)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
