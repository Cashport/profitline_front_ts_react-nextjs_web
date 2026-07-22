import { AlertCircle, CheckCircle } from "lucide-react";

import {
  IMedicalAccountNoveltyApi,
  MedicalAccountSeverity
} from "@/types/medicalAccounts/IMedicalAccounts";
import { NOVEDAD_TYPE_LABELS } from "../../constants";
import { cn } from "@/utils/utils";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import { ItemType } from "antd/es/menu/interface";

interface MedicalAccountNovedadesProps {
  novedades: IMedicalAccountNoveltyApi[];
}

const SEVERITY_STYLES: Record<MedicalAccountSeverity, string> = {
  CRITICA: "border-red-200 bg-red-50 text-red-600",
  ALTA: "border-amber-200 bg-amber-50 text-amber-600",
  MEDIA: "border-yellow-200 bg-yellow-50 text-yellow-700",
  BAJA: "border-gray-200 bg-gray-50 text-gray-500"
};

const SEVERITY_LABELS: Record<MedicalAccountSeverity, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja"
};

export function MedicalAccountNovedades({ novedades }: MedicalAccountNovedadesProps) {
  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <span className="text-xs font-semibold text-gray-600">Novedades</span>
        {novedades.length > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-amber-600">
            {novedades.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {novedades.map((novedad) => {
          const menuItems: ItemType[] = [
            {
              key: "confirm",
              label: "Confirmar novedad",
              icon: <CheckCircle className="h-3.5 w-3.5" />
            }
          ];

          return (
            <div key={novedad.id} className="flex items-start gap-3 px-6 py-3.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-3 w-3 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-700">
                  {NOVEDAD_TYPE_LABELS[novedad.novelty_type] ?? novedad.novelty_type}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{novedad.description}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  SEVERITY_STYLES[novedad.severity] ?? SEVERITY_STYLES.BAJA
                )}
              >
                {SEVERITY_LABELS[novedad.severity] ?? novedad.severity}
              </span>
              <DotsDropdown
                items={menuItems}
                customButtonStyle={{
                  height: 24,
                  width: 24,
                  minWidth: 24,
                  padding: 0,
                  border: "none",
                  boxShadow: "none",
                  background: "transparent"
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
