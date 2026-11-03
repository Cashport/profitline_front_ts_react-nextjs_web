"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "use-intl";

interface AdvisorDetailPendingProps {
  /** El pedido del detalle del día falló. */
  failed: boolean;
  onBack: () => void;
}

/** Panel del asesor mientras llega su detalle del día, o si no se pudo traer. */
export default function AdvisorDetailPending({ failed, onBack }: AdvisorDetailPendingProps) {
  const tv = useTranslations("visits.detail");
  return (
    <div className="min-h-0 flex-1 px-4 py-3.5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 py-1 text-[13px] tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        {tv("team")}
      </button>
      <p className="px-2 py-3.5 text-[13px] text-muted-foreground">
        {failed ? tv("loadError") : tv("loading")}
      </p>
    </div>
  );
}
