import { CheckCircle, X } from "phosphor-react";
import { Badge } from "@/modules/chat/ui/badge";
import { IClientDetailArchivesByType } from "@/types/dataQuality/IDataQuality";

const CASHPORT_GREEN = "#CBE71E";
const CASHPORT_GREEN_SOFT = "rgba(203, 231, 30, 0.15)";
const GRAY = "#969696";

interface IArchiveTypeCollapseLabelProps {
  group: IClientDetailArchivesByType;
  active: boolean;
  onToggle: () => void;
}

export function ArchiveTypeCollapseLabel({
  group,
  active,
  onToggle
}: IArchiveTypeCollapseLabelProps) {
  return (
    <div className="flex items-center justify-between w-full pr-2">
      <div
        className="inline-flex items-center gap-3 rounded-lg"
        style={{ backgroundColor: "#f7f7f7" }}
      >
        <Badge
          variant="secondary"
          className="text-xs text-white"
          style={{ backgroundColor: group.data_type?.color ?? GRAY }}
        >
          {group.tipo_archivo}
        </Badge>
        <span className="text-xs pr-3 font-medium" style={{ color: "#141414", opacity: 0.5 }}>
          {group.pending_archives} / {group.total_archives} Pendientes
        </span>
      </div>
      <button
        type="button"
        aria-pressed={active}
        title={active ? "Ocultar procesados" : "Mostrar procesados"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-1 rounded-full transition-colors"
        style={{
          backgroundColor: active ? CASHPORT_GREEN_SOFT : "transparent",
          padding: active ? "2px 6px" : "2px"
        }}
      >
        <CheckCircle
          size={20}
          weight={active ? "fill" : "regular"}
          color={active ? CASHPORT_GREEN : GRAY}
        />
        {active && <X size={14} color={GRAY} />}
      </button>
    </div>
  );
}
