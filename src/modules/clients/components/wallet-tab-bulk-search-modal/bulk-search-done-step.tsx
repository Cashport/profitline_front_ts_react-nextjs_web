import { Button } from "antd";
import { Check, DownloadSimple } from "phosphor-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { formatNumber } from "@/utils/utils";
import { downloadCsv } from "./bulk-search-utils";
import { IBulkAction, IBulkDoneSummary, IBulkSearchRow } from "./types";

interface Props {
  action: IBulkAction;
  summary: IBulkDoneSummary;
  /** Facturas a las que se aplicó la acción. */
  rows: IBulkSearchRow[];
  onAnotherAction: () => void;
  onClose: () => void;
}

const BulkSearchDoneStep = ({ action, summary, rows, onAnotherAction, onClose }: Props) => {
  // Mock: el reporte real lo generará el servicio
  const handleDownloadReport = () =>
    downloadCsv(
      `reporte_${action.key}.csv`,
      ["ID factura", "Resultado", "Detalle"],
      rows.map((row, index) =>
        index % 250 === 3
          ? [row.id, "Error", "Factura bloqueada por otra operación"]
          : [row.id, "OK", action.label]
      )
    );

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-[440px] max-w-full flex-col items-center gap-2.5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Check size={22} weight="bold" />
        </span>
        <span className="text-[17px] font-semibold">{action.label} completado</span>
        <span className="text-xs text-muted-foreground">
          {summary.errors
            ? "Revisa el reporte para ver el motivo de cada error."
            : "Todas las facturas se procesaron."}
        </span>

        <div className="mt-1.5 grid w-full grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#f7f7f7] px-3 py-2.5 text-left">
            <span className="block text-[11px] text-muted-foreground">Procesadas</span>
            <span className="text-[17px] font-semibold tabular-nums">
              {formatNumber(summary.ok)}
            </span>
          </div>
          <div className="rounded-lg bg-[#f7f7f7] px-3 py-2.5 text-left">
            <span className="block text-[11px] text-muted-foreground">Con error</span>
            <span className="text-[17px] font-semibold tabular-nums text-[#c4321c]">
              {formatNumber(summary.errors)}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button size="large" icon={<DownloadSimple size={14} />} onClick={handleDownloadReport}>
            Reporte en Excel
          </Button>
          <Button size="large" onClick={onAnotherAction}>
            Otra acción
          </Button>
          <PrincipalButton onClick={onClose}>Cerrar</PrincipalButton>
        </div>
      </div>
    </div>
  );
};

export default BulkSearchDoneStep;
