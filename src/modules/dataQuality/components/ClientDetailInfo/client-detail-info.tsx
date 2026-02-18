import { Button } from "@/modules/chat/ui/button";
import { Edit } from "lucide-react";

interface ClientDetailInfoProps {
  stakeholder?: string | null | undefined;
  clientName?: string | null | undefined;
  setIsEditClientOpen: (isOpen: boolean) => void;
}

export function ClientDetailInfo({
  stakeholder,
  clientName,
  setIsEditClientOpen
}: ClientDetailInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
          Información general
        </h2>

        <Button
          variant="outline"
          className="text-sm font-medium bg-transparent"
          onClick={() => setIsEditClientOpen(true)}
          style={{ borderColor: "#DDDDDD", color: "#141414" }}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
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
      </div>
    </div>
  );
}
