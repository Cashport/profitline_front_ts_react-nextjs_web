import React from "react";
import { LucideIcon, History, Edit } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";

// Interfaces de datos
interface SubValidation {
  name: string;
  completedBy: string;
  createdAt: string;
  isCompleted: boolean;
}

interface OrderStage {
  id: number;
  name: string;
  icon: LucideIcon;
  completedBy: string | null;
  completedAt: string | null;
  subValidations?: SubValidation[];
}

interface PurchaseOrderProcessProps {
  currentStage: number;
  orderStages: OrderStage[];
  onShowHistory: () => void;
  onShowStock: () => void;
  onPrefetchHistory?: () => void;
}

export function PurchaseOrderProcess({
  currentStage,
  orderStages,
  onShowHistory,
  onShowStock,
  onPrefetchHistory
}: PurchaseOrderProcessProps) {
  return (
    <TooltipProvider>
      <div className="mb-8 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cashport-black">Proceso de la orden</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowStock}
              className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Ver stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              onMouseEnter={onPrefetchHistory}
              className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-white"
            >
              <History className="h-4 w-4 mr-2" />
              Ver historial completo
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          {orderStages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isPending = stage.id > currentStage;

            return (
              <React.Fragment key={stage.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-[#CBE71E] text-black"
                            : isCurrent
                              ? "bg-[#CBE71E] text-black"
                              : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        <StageIcon className="h-6 w-6" />
                      </div>
                      <span className="text-xs mt-2 text-center max-w-[80px] text-cashport-black font-medium">
                        {stage.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-cashport-black text-white">
                    {stage.subValidations ? (
                      <div className="text-xs space-y-2">
                        <p className="font-semibold mb-2">{stage.name}</p>
                        {stage.subValidations.map((subVal, idx) => (
                          <div
                            key={idx}
                            className="border-t border-gray-700 pt-2 first:border-t-0 first:pt-0"
                          >
                            <p className="font-medium">{subVal.name}</p>
                            {subVal.isCompleted ? (
                              <>
                                <p className="text-gray-300">{subVal.completedBy}</p>
                                <p className="text-gray-400">{subVal.createdAt}</p>
                              </>
                            ) : (
                              <p className="text-gray-400">Pendiente</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs">
                        <p className="font-semibold mb-1">{stage.name}</p>
                        <p className="text-gray-400">Pendiente</p>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>

                {index < orderStages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      stage.id < currentStage ? "bg-[#CBE71E]" : "bg-gray-300"
                    }`}
                    style={{ marginTop: "-24px" }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

export type { OrderStage, SubValidation };
