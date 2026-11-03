import { BellRing } from "lucide-react";

import AlertsHeader from "../alerts-header/alerts-header";

/** Mientras se conecta el API, el módulo muestra este aviso en lugar de los datos simulados. */
export default function ComingSoon() {
  return (
    <>
      <AlertsHeader crumbs={[{ label: "Alertas de bloqueo" }]} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cp-lime-tint">
          <BellRing className="h-6 w-6 text-cp-ink" />
        </div>
        <h2 className="m-0 text-[18px] font-semibold text-cp-ink">Próximamente</h2>
        <p className="m-0 max-w-[420px] text-[14px] text-cp-ink-3">
          Muy pronto vas a poder ver aquí los clientes y puntos de venta bloqueados o por bloquear
          por cartera vencida.
        </p>
      </div>
    </>
  );
}
