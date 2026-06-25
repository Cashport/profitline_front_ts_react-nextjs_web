import { AlertCircle, CheckCircle2 } from "lucide-react";

import { IMedicalAccountNovedad } from "../../types/IMedicalAccount";
import { NOVEDAD_TYPE_LABELS } from "../../constants";
import { cn } from "@/utils/utils";

interface MedicalAccountNovedadesProps {
  novedades: IMedicalAccountNovedad[];
}

export function MedicalAccountNovedades({ novedades }: MedicalAccountNovedadesProps) {
  const pendingCount = novedades.filter((novedad) => !novedad.resuelta).length;

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <span className="text-xs font-semibold text-gray-600">Novedades</span>
        {pendingCount > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-amber-600">
            {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {novedades.map((novedad) => (
          <div
            key={novedad.id}
            className={cn(
              "flex items-start gap-3 px-6 py-3.5",
              !novedad.resuelta && "bg-amber-50/30"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                novedad.resuelta ? "bg-emerald-100" : "bg-amber-100"
              )}
            >
              {novedad.resuelta ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-xs font-semibold",
                  novedad.resuelta ? "text-gray-500" : "text-amber-700"
                )}
              >
                {NOVEDAD_TYPE_LABELS[novedad.tipo] ?? novedad.tipo}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{novedad.descripcion}</p>
            </div>
            {novedad.resuelta && (
              <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Resuelta
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
