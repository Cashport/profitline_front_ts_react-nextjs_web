import { AlertCircle, CheckCircle2 } from "lucide-react";

import { IMedicalAccountNovedad } from "../../types/IMedicalAccount";

interface MedicalAccountNovedadesProps {
  novedades: IMedicalAccountNovedad[];
}

export function MedicalAccountNovedades({ novedades }: MedicalAccountNovedadesProps) {
  const pendingCount = novedades.filter((novedad) => !novedad.resuelta).length;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-600">Novedades</h2>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {novedades.map((novedad) => (
          <div
            key={novedad.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              novedad.resuelta ? "border-gray-100 bg-white" : "border-amber-100 bg-amber-50/30"
            }`}
          >
            {novedad.resuelta ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            )}
            <p className="flex-1 text-sm text-cashport-black">{novedad.descripcion}</p>
            {novedad.resuelta && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                Resuelta
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
