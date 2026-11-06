import { Button } from "@/modules/chat/ui/button";
import { Edit } from "lucide-react";
import { IClientTier, TierBadge } from "../../tiers";

interface ClientDetailInfoProps {
  stakeholder?: string | null | undefined;
  clientName?: string | null | undefined;
  tier?: IClientTier | null;
  setIsEditClientOpen: (isOpen: boolean) => void;
  showEditButton?: boolean;
}

export function ClientDetailInfo({
  stakeholder,
  clientName,
  tier,
  setIsEditClientOpen,
  showEditButton = true
}: ClientDetailInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
          Información general
        </h2>

        {showEditButton && (
          <Button
            variant="ghost"
            className="h-[var(--control-h)] border-0 bg-[#f7f7f7] text-[13px] font-medium text-[#141414] hover:bg-[#efefef]"
            onClick={() => setIsEditClientOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
            Cliente
          </p>
          <p className="text-sm" style={{ color: "#141414" }}>
            {clientName || ""}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
            Stakeholder
          </p>
          <p className="text-sm" style={{ color: "#141414" }}>
            {stakeholder || ""}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
            Clasificación
          </p>
          <div className="flex items-center gap-2">
            <TierBadge tier={tier} showEmpty />
            {!tier && showEditButton && (
              <button
                type="button"
                onClick={() => setIsEditClientOpen(true)}
                className="text-[13px] font-semibold text-[#141414] hover:underline"
              >
                Clasificar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
