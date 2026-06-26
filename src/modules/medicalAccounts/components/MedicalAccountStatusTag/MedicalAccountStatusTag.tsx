import { MedicalAccountStatus } from "../../types/IMedicalAccount";

const STATUS_STYLES: Record<MedicalAccountStatus, string> = {
  "Por Radicar": "bg-gray-100 text-gray-600 border-gray-200",
  "Pre Radicado": "bg-blue-50 text-blue-600 border-blue-200",
  Radicado: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Novedad: "bg-amber-50 text-amber-600 border-amber-200",
  Anulado: "bg-red-50 text-red-600 border-red-200"
};

// Neutral style for statuses outside the union (e.g. backend status_name values not yet mapped).
const FALLBACK_STYLE = "bg-gray-100 text-gray-600 border-gray-200";

interface MedicalAccountStatusTagProps {
  status: MedicalAccountStatus | string;
}

export function MedicalAccountStatusTag({ status }: MedicalAccountStatusTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status as MedicalAccountStatus] ?? FALLBACK_STYLE
      }`}
    >
      {status}
    </span>
  );
}
