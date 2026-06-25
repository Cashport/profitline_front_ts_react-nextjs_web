import { IMedicalAccount } from "../../types/IMedicalAccount";
import { SERVICE_TYPE_LABELS, TIPO_DOCUMENTO_LABELS } from "../../constants";
import { formatDate } from "../../utils/format";

interface MedicalAccountInfoPanelProps {
  account: IMedicalAccount;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-cashport-black">{value}</p>
  </div>
);

const withLabel = (code: string | null | undefined, labels: Record<string, string>) => {
  if (!code) return "-";
  return labels[code] ? `${code} — ${labels[code]}` : code;
};

export function MedicalAccountInfoPanel({ account }: MedicalAccountInfoPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-600">Información del paciente</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre" value={account.nombrePaciente ?? "-"} />
          <Field
            label="Tipo de documento"
            value={withLabel(account.tipoDocumento, TIPO_DOCUMENTO_LABELS)}
          />
          <Field label="No. Documento" value={account.documentoPaciente ?? "-"} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-600">Información del servicio</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="No. Autorización" value={account.idAutorizacion ?? "-"} />
          <Field label="Régimen" value={account.regimen ?? "-"} />
          <Field label="Fecha de servicio" value={formatDate(account.fechaServicio)} />
          <Field
            label="Tipo de servicio"
            value={withLabel(account.tipoServicio, SERVICE_TYPE_LABELS)}
          />
          <Field label="Fecha de cargue" value={formatDate(account.fechaCarga)} />
        </div>
      </div>
    </div>
  );
}
