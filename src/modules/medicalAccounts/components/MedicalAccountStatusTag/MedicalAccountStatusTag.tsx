import { MedicalAccountStatusCode } from "../../types/IMedicalAccount";

const STATUS_STYLES: Record<MedicalAccountStatusCode, string> = {
  PENDIENTE_AUDITORIA: "bg-blue-50 text-blue-600 border-blue-200",
  AUDITADO: "bg-emerald-50 text-emerald-600 border-emerald-200",
  FACTURADO: "bg-purple-50 text-purple-600 border-purple-200",
  RADICADO: "bg-cyan-50 text-cyan-600 border-cyan-200",
  NOVEDAD: "bg-amber-50 text-amber-600 border-amber-200"
};

const FALLBACK_STYLE = "bg-gray-100 text-gray-600 border-gray-200";

interface MedicalAccountStatusTagProps {
  status: MedicalAccountStatusCode | string;
}

export function MedicalAccountStatusTag({ status }: MedicalAccountStatusTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status as MedicalAccountStatusCode] ?? FALLBACK_STYLE
      }`}
    >
      {status}
    </span>
  );
}
