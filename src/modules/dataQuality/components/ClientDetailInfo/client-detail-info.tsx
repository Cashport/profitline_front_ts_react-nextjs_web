import { Badge } from "@/modules/chat/ui/badge";

interface ClientDetailInfoProps {
  stakeholder?: string | null | undefined;
  clientName?: string | null | undefined;
}

export function ClientDetailInfo({ stakeholder, clientName }: ClientDetailInfoProps) {
  return (
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
  );
}
