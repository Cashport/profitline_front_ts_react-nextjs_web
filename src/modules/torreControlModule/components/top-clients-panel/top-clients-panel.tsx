"use client";

import { useTranslations } from "use-intl";

import PanelCard from "@/components/ui/panel-card/panel-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import { corto, fmtM, pct } from "@/modules/walletModule/utils/format";
import type { ITorreCliente } from "../../types";

interface TopClientsPanelProps {
  clientes: ITorreCliente[];
}

const TH = "bg-cp-surface px-3 py-3 text-left text-[13.5px] font-semibold text-cp-ink";

/** Los ocho clientes con más saldo vencido que nadie ha tocado. */
export default function TopClientsPanel({ clientes }: TopClientsPanelProps) {
  const t = useTranslations("controlTower.topCustomers");
  const tCommon = useTranslations("common");
  return (
    <PanelCard title={t("title")} hint={t("hint")} flush>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-cp-line">
              <th className={TH}>{tCommon("fields.customer")}</th>
              <th className={TH}>{t("collector")}</th>
              <th className={`${TH} text-right`}>{t("pastDue")}</th>
              <th className={`${TH} text-right`}>{t("unreconciled")}</th>
              <th className={`${TH} text-right`}>{t("covered")}</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-9 text-center text-muted-foreground">
                  {t("empty")}
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
