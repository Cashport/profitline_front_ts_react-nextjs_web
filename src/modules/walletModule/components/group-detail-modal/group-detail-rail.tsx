"use client";

import { EST_META } from "../../constants";
import { fmtD, fmtFull, fmtM } from "../../utils/format";
import { resumenFacturas, sevDias } from "../../utils/group-detail";
import DetailTooltip, { tramoRows } from "../shared/detail-tooltip";
import DistBar from "../shared/dist-bar";
import PersonBadge from "../shared/person-badge";
import StatusChip from "../shared/status-chip";
import type { IWalletGroupDetail } from "../../types";

interface GroupDetailRailProps {
  detail: IWalletGroupDetail;
  /** Mientras las facturas no lleguen, lo que se deriva de ellas no se pinta. */
  loading?: boolean;
}

/** Una fila del listado clave/valor: etiqueta, valor y un chip a la derecha. */
const Row = ({
  label,
  value,
  chip
}: {
  label: string;
  value?: React.ReactNode;
  chip?: React.ReactNode;
}) => (
  <div className="grid grid-cols-[max-content_minmax(0,1fr)_34px] items-center gap-x-[7px]">
    <dt className="whitespace-nowrap text-[11.5px] text-muted-foreground">{label}</dt>
    <dd className="m-0 truncate text-[12.5px] font-semibold leading-tight text-foreground">
      {value}
    </dd>
    <span className="flex items-center justify-end">{chip}</span>
  </div>
);

/** Días sin gestión, con el mismo semáforo que la tabla de grupos. */
const GestionChip = ({ dias }: { dias: number | null }) => {
  if (dias === null) return <span className="text-muted-foreground">—</span>;
  return (
    <StatusChip sev={dias <= 3 ? "ok" : dias <= 7 ? "warn" : "crit"}>
      {dias === 0 ? "Hoy" : `${dias}d`}
    </StatusChip>
  );
};

/** Cabecera del panel izquierdo: cifras del grupo y su reparto por tramo. */
export default function GroupDetailRail({ detail, loading }: GroupDetailRailProps) {
  const nov = detail.novedad;
  const { vencido, edad } = resumenFacturas(detail.facturas);

  const compromiso = nov?.compromiso && sevDias(nov.compromiso);
  const limite = nov?.limite && sevDias(nov.limite, 5);

  return (
    <div className="px-[18px] pb-3 pt-[11px]">
      <dl className="m-0 grid grid-cols-2 gap-x-[18px] gap-y-1.5">
        <Row label="Saldo" value={fmtFull(detail.monto)} />
        <Row label="Facturas" value={loading ? "…" : detail.facturas.length} />

        {nov ? (
          <>
            <Row label="Responsable" value={<PersonBadge person={nov.responsable} mini />} />
            <Row label="Últ. gestión" chip={<GestionChip dias={detail.diasSinGestion} />} />
            <Row
              label="Compromiso"
              value={nov.compromiso ? fmtD(nov.compromiso) : "—"}
              chip={compromiso && <StatusChip sev={compromiso.sev}>{compromiso.txt}</StatusChip>}
            />
            <Row
              label="Fecha límite"
              value={nov.limite ? fmtD(nov.limite) : "—"}
              chip={limite && <StatusChip sev={limite.sev}>{limite.txt}</StatusChip>}
            />
          </>
        ) : (
          <>
            <Row label="Ejecutivo" value={<PersonBadge person={detail.ejecutivo} mini />} />
            <Row label="Últ. gestión" chip={<GestionChip dias={detail.diasSinGestion} />} />
            <Row label="Vencido" value={loading ? "…" : fmtM(vencido)} />
            <Row
              label="Mora prom."
              value={loading ? "…" : edad}
              chip={
                !loading && (
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {edad === 1 ? "día" : "días"}
                  </span>
                )
              }
            />
          </>
        )}
      </dl>

      {/* El div envolvente es para AntD: DistBar no reenvía el ref del Tooltip. */}
      {detail.monto > 0 && (
        <DetailTooltip
          title="Reparto por tramo"
          rows={tramoRows(detail.tramos)}
          total={{ value: fmtM(detail.monto) }}
        >
          <div className="mt-[11px]">
            <DistBar
              tramos={detail.tramos}
              monto={detail.monto}
              className="h-1 max-w-none rounded"
            />
          </div>
        </DetailTooltip>
      )}

      {!nov && (
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {EST_META[detail.tipo].corta}.
        </p>
      )}
    </div>
  );
}
