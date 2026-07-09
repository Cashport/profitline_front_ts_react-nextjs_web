import { CheckCircle, X } from "phosphor-react";
import { Eye } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import {
  IClientDetailArchivesByType,
  IClientDetailDataArchive
} from "@/types/dataQuality/IDataQuality";

const CASHPORT_GREEN = "#CBE71E";
const CASHPORT_GREEN_SOFT = "rgba(203, 231, 30, 0.15)";
const GRAY = "#969696";

interface IArchiveTypeCollapseLabelProps {
  group: IClientDetailArchivesByType;
  intake?: IClientDetailDataArchive | null;
  active: boolean;
  onToggle: () => void;
  onViewIntake?: () => void;
}

export function ArchiveTypeCollapseLabel({
  group,
  intake,
  active,
  onToggle,
  onViewIntake
}: IArchiveTypeCollapseLabelProps) {
  return (
    <div className="flex items-center justify-between w-full pr-2">
      <div className="flex items-center gap-3">
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
        {intake && (
          <>
            <Badge variant="outline" className="text-xs">
              {intake.periodicity}
            </Badge>
            <p className="text-xs" style={{ color: "#141414" }}>
              Se produce {intake.periodicity_json.repeat.frequency}{" "}
              {intake.periodicity_json.repeat.interval} veces iniciando el{" "}
              {intake.periodicity_json.start_date}
            </p>
            <span className="text-xs font-semibold" style={{ color: "#141414" }}>
              Fuente:
            </span>
            <span className="text-xs" style={{ color: "#141414" }}>
              {intake.intake_type?.description || "-"}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
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
        {intake && (
          <Button
            variant="outline"
            size="icon"
            title="Ver detalles"
            onClick={(e) => {
              e.stopPropagation();
              onViewIntake?.();
            }}
            className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
