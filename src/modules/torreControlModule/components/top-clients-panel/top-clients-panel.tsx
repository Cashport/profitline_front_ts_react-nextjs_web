"use client";

import PanelCard from "@/components/ui/panel-card/panel-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import { corto, fmtM, pct } from "@/modules/walletModule/utils/format";
import type { ITorreCliente } from "../../types";

interface TopClientsPanelProps {
  clientes: ITorreCliente[];
}

const TH = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.03em]";

/** Los ocho clientes con más saldo vencido que nadie ha tocado. */
export default function TopClientsPanel({ clientes }: TopClientsPanelProps) {
  return (
    <PanelCard title="Clientes con más saldo sin conciliar" hint="vencido sin acuerdo ni novedad" flush>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className={TH}>Cliente</th>
              <th className={TH}>Ejecutivo</th>
              <th className={`${TH} text-right`}>Vencido</th>
              <th className={`${TH} text-right`}>Sin conciliar</th>
              <th className={`${TH} text-right`}>Cubierto</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-9 text-center text-muted-foreground">
                  Sin clientes con vencido bajo estos filtros.
                </td>
              </tr>
            ) : (
              // TODO: al hacer clic debería abrirse la matriz de cartera en este
              // cliente; hoy /wallet no acepta un drilldown por URL.
              clientes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2.5 font-semibold text-foreground">{corto(c.nombre)}</td>
                  <td className="px-3 py-2.5">
                    <PersonBadge person={c.ejecutivo} mini />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {fmtM(c.vencido)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {fmtM(c.sinConciliar)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {pct(c.cubierto, c.vencido).toFixed(0)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
