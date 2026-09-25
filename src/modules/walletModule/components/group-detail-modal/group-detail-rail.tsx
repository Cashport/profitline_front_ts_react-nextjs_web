"use client";

import { EST_META, TRAMOS } from "../../constants";
import { fmtD, fmtFull, fmtM } from "../../utils/format";
import { sevDias, vencidoDeTramos } from "../../utils/group-detail";
import { sumaTramos } from "../../utils/wallet-calc";
import DetailTooltip, { tramoRows } from "../shared/detail-tooltip";
import DistBar from "../shared/dist-bar";
import PersonBadge from "../shared/person-badge";
import StatusChip from "../shared/status-chip";
import type { IWalletGroupDetail } from "../../types";

interface GroupDetailRailProps {
  detail: IWalletGroupDetail;
}

/** Marca de dato pendiente: no hay de dónde sacarlo todavía. */
const Pendiente = () => <span className="text-muted-foreground">XX</span>;

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
export default function GroupDetailRail({ detail }: GroupDetailRailProps) {
  const nov = detail.novedad;
  const vencido = vencidoDeTramos(detail.tramos);

  // Abierto desde una celda de la matriz, el grupo llega recortado a ese tramo:
  // saldo, reparto y conteo son su parte, no la del grupo entero. Se rotula
  // para que no se lea como el total de la gestión.
  const tramo = detail.tramo ?? null;
  const sufijo = tramo === null ? "" : ` en ${TRAMOS[tramo].short}`;

  const compromiso = nov?.compromiso && sevDias(nov.compromiso);
  const limite = nov?.limite && sevDias(nov.limite, 5);

  return (
    <div className="px-[18px] pb-3 pt-[11px]">
      <dl className="m-0 grid grid-cols-2 gap-x-[18px] gap-y-1.5">
        <Row label={`Saldo${sufijo}`} value={fmtFull(detail.monto)} />
        <Row label={`Facturas${sufijo}`} value={detail.totalFacturas} />

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
            <Row label="Vencido" value={fmtM(vencido)} />
            {/* La mora promedio necesita las facturas de verdad; ninguna de las
                dos respuestas del API la trae, así que se marca pendiente. */}
            <Row label="Mora prom." value={<Pendiente />} />
          </>
        )}
      </dl>

      {/* El div envolvente es para AntD: DistBar no reenvía el ref del Tooltip. */}
      {sumaTramos(detail.tramos) > 0 && (
        <DetailTooltip
          title="Reparto por tramo"
          rows={tramoRows(detail.tramos)}
          // El pie cierra con las filas del propio tooltip, no con `monto`, que
          // el API recorta cuando se pide un tramo.
          total={{ value: fmtM(sumaTramos(detail.tramos)) }}
        >
          <div className="mt-[11px]">
            <DistBar tramos={detail.tramos} className="h-1 max-w-none rounded" />
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
