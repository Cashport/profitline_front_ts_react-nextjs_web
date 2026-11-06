import type { SupportCriticality, SupportStatus } from "@/types/support/ISupport";
import { CRITICALITY_META, STATUS_META, statusLabel } from "../../utils/support-format";

export function CriticalityTag({
  value,
  inherited = false
}: {
  value: SupportCriticality;
  inherited?: boolean;
}) {
  const meta = CRITICALITY_META[value];
  return (
    <span
      className="inline-flex h-[26px] items-center whitespace-nowrap rounded-md px-2.5 text-[13px] font-semibold"
      style={
        inherited
          ? { border: `1px solid ${meta.color}`, color: meta.color }
          : { background: meta.color, color: "#fff" }
      }
      title={inherited ? "Heredada de la categoría" : undefined}
    >
      {meta.label}
    </span>
  );
}

export function StatusDot({ value, asAgent = false }: { value: SupportStatus; asAgent?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: STATUS_META[value].color }}
      />
      {statusLabel(value, asAgent)}
    </span>
  );
}
