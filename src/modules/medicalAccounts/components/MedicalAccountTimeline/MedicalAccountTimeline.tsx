"use client";

import { Fragment } from "react";
import { Upload, Hourglass, ShieldCheck, Receipt, FileCheck2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import { useMedicalAccountHistory } from "../../hooks/useMedicalAccountHistory";
import { useMedicalAccountStatuses } from "../../hooks/useMedicalAccountStatuses";
import { IMedicalAccountHistoryItem } from "@/types/medicalAccounts/IMedicalAccounts";

interface MedicalAccountTimelineProps {
  accountId: number;
  currentStatusCode: string;
}

const STAGE_ORDER: string[] = [
  "CARGUE",
  "PENDIENTE_AUDITORIA",
  "AUDITADO",
  "FACTURADO",
  "RADICADO"
];

const STAGE_ICONS: Record<string, LucideIcon> = {
  CARGUE: Upload,
  PENDIENTE_AUDITORIA: Hourglass,
  AUDITADO: ShieldCheck,
  FACTURADO: Receipt,
  RADICADO: FileCheck2
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getActor = (item: IMedicalAccountHistoryItem): string => {
  if (item.created_by_name) return item.created_by_name;
  if (item.created_by) return item.created_by;
  return "Sistema";
};

// NOVEDAD no es una etapa del flujo: es una condición del CARGUE.
// Por eso se mapea al primer nodo hasta que las novedades se resuelvan
// y la cuenta pase a PENDIENTE_AUDITORIA.
const getStageIndex = (code: string): number => {
  if (code === "NOVEDAD") return STAGE_ORDER.indexOf("CARGUE");
  return STAGE_ORDER.indexOf(code);
};

export function MedicalAccountTimeline({
  accountId,
  currentStatusCode
}: MedicalAccountTimelineProps) {
  const { history } = useMedicalAccountHistory(accountId);
  const { statuses } = useMedicalAccountStatuses();

  const statusNameByCode = new Map(statuses.map((s) => [s.code, s.name]));

  const stageInfo: Record<
    string,
    { actor: string; when: string; from: string | null }
  > = {};
  history.forEach((item) => {
    stageInfo[item.to_status_code] = {
      actor: getActor(item),
      when: formatDateTime(item.created_at),
      from: item.from_status_name ?? null
    };
  });

  const currentIndex = getStageIndex(currentStatusCode);

  return (
    <TooltipProvider>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          {STAGE_ORDER.map((code, index) => {
            const StageIcon = STAGE_ICONS[code];
            const name = statusNameByCode.get(code) ?? code;
            // Para el primer nodo también se muestran los eventos de NOVEDAD.
            const info =
              code === "CARGUE"
                ? stageInfo["CARGUE"] ?? stageInfo["NOVEDAD"]
                : stageInfo[code];
            const isCompleted = currentIndex !== -1 && index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <Fragment key={code}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted || isCurrent
                            ? "bg-[#CBE71E] text-black"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        <StageIcon className="h-6 w-6" />
                      </div>
                      <span className="text-xs mt-2 text-center max-w-[110px] text-cashport-black font-medium">
                        {name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-cashport-black text-white">
                    <div className="text-xs space-y-1">
                      <p className="font-semibold mb-1">{name}</p>
                      {info ? (
                        <>
                          {info.from && (
                            <p>
                              {info.from} → {name}
                            </p>
                          )}
                          <p>Por: {info.actor}</p>
                          <p className="text-gray-400">{info.when}</p>
                        </>
                      ) : isCurrent ? (
                        currentStatusCode === "NOVEDAD" ? (
                          <p className="text-gray-300">Con novedades · Estado actual</p>
                        ) : (
                          <p className="text-gray-300">Estado actual</p>
                        )
                      ) : (
                        <p className="text-gray-300">Pendiente</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {index < STAGE_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentIndex ? "bg-[#CBE71E]" : "bg-gray-300"
                    }`}
                    style={{ marginTop: "-24px" }}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}