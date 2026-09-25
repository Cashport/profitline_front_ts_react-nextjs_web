import { STATUS_COLORS, STATUS_COLOR_FALLBACK } from "../../constants";

interface MedicalAccountStatusTagProps {
  statusCode: string | null | undefined;
  statusName: string;
}

export function MedicalAccountStatusTag({ statusCode, statusName }: MedicalAccountStatusTagProps) {
  const color = (statusCode && STATUS_COLORS[statusCode]) || STATUS_COLOR_FALLBACK;

  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{
        color,
        borderColor: color,
        backgroundColor: `${color}1A`
      }}
    >
      {statusName}
    </span>
  );
}
