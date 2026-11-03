import {
  APPROVAL_ENTITY_STATUS_LABELS,
  APPROVAL_ENTITY_STATUS_STYLES,
  getApprovalEntityStatus
} from "@/constants/approvalEntityStatus";

interface Props {
  statusId?: number | null;
}

export default function ApprovalStatusPill({ statusId }: Readonly<Props>) {
  const status = getApprovalEntityStatus(statusId);
  if (!status) return <span className="text-sm text-[#999999]">—</span>;

  return (
    <span
      className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit whitespace-nowrap ${APPROVAL_ENTITY_STATUS_STYLES[status]}`}
    >
      {APPROVAL_ENTITY_STATUS_LABELS[status]}
    </span>
  );
}
