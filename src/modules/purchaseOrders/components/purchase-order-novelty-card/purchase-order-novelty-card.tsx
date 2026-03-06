import { AlertTriangle } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { IPurchaseOrderNovelty } from "@/types/purchaseOrders/purchaseOrders";

interface PurchaseOrderNoveltyCardProps {
  novelties: IPurchaseOrderNovelty[];
}

export function PurchaseOrderNoveltyCard({ novelties }: PurchaseOrderNoveltyCardProps) {
  if (novelties.length === 0) return null;

  return (
    <div
      className="mb-6 rounded-lg border-2 p-4"
      style={{
        backgroundColor: "#FFF3E0",
        borderColor: "#FFE0B2"
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFA72620" }}
        >
          <AlertTriangle className="h-5 w-5" style={{ color: "#FFA726" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base" style={{ color: "#FFA726" }}>
              Novedades
            </h3>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: "#FFA726",
                color: "#FFA726",
                backgroundColor: "white"
              }}
            >
              Requiere atención
            </Badge>
          </div>
          <div className="space-y-2">
            {novelties.map((novelty) => (
              <div key={novelty.id} className="flex items-start gap-2 text-sm">
                <span className="text-orange-500 mt-0.5">•</span>
                <p className="text-gray-700 text-xs">
                  <strong>{novelty.novelty_type_name}:</strong> {novelty.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
