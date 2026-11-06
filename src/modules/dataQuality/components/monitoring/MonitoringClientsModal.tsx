"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import UiSearchInput from "@/components/ui/search-input";
import { IMonitoringClientRow, IMonitoringSummary } from "../../types/monitoring";
import { DetailTab, isDetailTab } from "./MonitoringCards";
import {
  ALERT_META,
  PERIODICITY_LABEL,
  SEVERITY_META,
  formatMonthLabel,
  formatNumber,
  formatShortDate,
  plural
} from "./monitoringFormat";

const TABS: Array<{ key: DetailTab; label: string; color?: string }> = [
  { key: "all", label: "Todos" },
  { key: "critical", label: "Críticos", color: SEVERITY_META.critical.color },
  { key: "late", label: "Retrasados", color: SEVERITY_META.late.color },
  { key: "novelty", label: "Con novedad", color: SEVERITY_META.novelty.color },
  { key: "received", label: "Recibidos", color: SEVERITY_META.received.color }
];

const tabFilter: Record<DetailTab, (r: IMonitoringClientRow) => boolean> = {
  all: () => true,
  critical: (r) => r.severity === "critical",
  late: (r) => r.severity === "late" || r.severity === "novelty",
  novelty: (r) => r.severity === "novelty",
  received: (r) => r.severity === "received"
};

type SortKey = "severity" | "client_name" | "last_received" | "days_late" | "missing_files";
const SEVERITY_RANK = { critical: 0, late: 1, novelty: 2, received: 3 } as const;

const sortValue = (r: IMonitoringClientRow, key: SortKey): string | number => {
  if (key === "severity") return SEVERITY_RANK[r.severity];
  if (key === "last_received") return r.last_received ?? "";
  return r[key];
};

export function MonitoringClientsModal({
  data,
  tab,
  onTabChange,
  onClose
}: {
  data: IMonitoringSummary;
  tab: DetailTab | null;
  onTabChange: (tab: DetailTab) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "severity", dir: 1 });
  const activeTab = isDetailTab(tab) ? tab : "all";

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.clients
      .filter(
        (r) => tabFilter[activeTab](r) && (!term || r.client_name.toLowerCase().includes(term))
      )
      .sort((a, b) => {
        const x = sortValue(a, sort.key);
        const y = sortValue(b, sort.key);
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir || b.days_late - a.days_late;
      });
  }, [data.clients, activeTab, search, sort]);

  const sortButton = (key: SortKey, label: string) => (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-semibold hover:text-cp-blue"
      onClick={() =>
        setSort((s) => ({
          key,
          dir:
            s.key === key
              ? ((s.dir * -1) as 1 | -1)
              : key === "client_name" || key === "severity"
                ? 1
                : -1
        }))
      }
    >
      {label}
      {sort.key === key && <span aria-hidden>{sort.dir === 1 ? "▲" : "▼"}</span>}
    </button>
  );

  return (
    <Modal
      open={tab !== null}
      onCancel={onClose}
      footer={null}
      width={1180}
      style={{ maxWidth: "100%" }}
      title={
        <div>
          <div className="text-[18px] font-semibold text-cp-ink">
            Detalle de recepción por cliente
          </div>
          <div className="text-[14px] font-normal text-cp-ink-3">
            {data.country.name} · {formatMonthLabel(data.period.month)} · Corte{" "}
            {formatShortDate(data.period.cutoff)}
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 py-[8px]">
        <div className="flex flex-wrap gap-[6px]">
          {TABS.map((t) => {
            const count = data.clients.filter(tabFilter[t.key]).length;
            const on = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`flex items-center gap-[6px] rounded-[8px] border px-[10px] py-[4px] text-[15px] ${
                  on
                    ? "border-cp-lime-dark font-semibold text-cp-ink"
                    : "border-transparent text-cp-ink-2"
                }`}
              >
                {t.color && (
                  <span
                    className="h-[9px] w-[9px] rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                )}
                {t.label}
                <span className="text-cp-ink-4">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="w-[300px] max-w-full">
          <UiSearchInput
            placeholder="Buscar cliente…"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full table-fixed text-[16px]">
          <thead className="sticky top-0 z-[1] bg-cp-surface">
            <tr className="border-b border-cp-line text-[15px] text-cp-ink">
              <th className="w-[120px] py-[10px] text-left">{sortButton("severity", "Estado")}</th>
              <th className="py-[10px] text-left">{sortButton("client_name", "Cliente")}</th>
              <th className="hidden w-[100px] py-[10px] text-left font-semibold md:table-cell">
                Periodicidad
              </th>
              <th className="hidden w-[100px] py-[10px] text-left font-semibold lg:table-cell">
                Canal
              </th>
              <th className="hidden w-[135px] py-[10px] text-left md:table-cell">
                {sortButton("last_received", "Último recibido")}
              </th>
              <th className="hidden w-[115px] py-[10px] text-left font-semibold lg:table-cell">
                Alerta
              </th>
              <th className="w-[125px] py-[10px] text-right">
                {sortButton("days_late", "Días de retraso")}
              </th>
              <th className="hidden w-[95px] py-[10px] text-right font-semibold md:table-cell">
                Recibidos
              </th>
              <th className="w-[85px] py-[10px] pr-[8px] text-right">
                {sortButton("missing_files", "Faltan")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sev = SEVERITY_META[r.severity];
              return (
                <tr key={r.client_id} className="h-[45px] border-b border-cp-line">
                  <td>
                    <span
                      className="flex items-center gap-[6px] text-[15px]"
                      style={{
                        color: r.severity === "critical" ? sev.color : undefined,
                        fontWeight: r.severity === "critical" ? 600 : 400
                      }}
                    >
                      <span
                        className="h-[9px] w-[9px] rounded-full"
                        style={{ backgroundColor: sev.color }}
                      />
                      {sev.label}
                    </span>
                  </td>
                  <td className="truncate pr-2">
                    <Link href={`/data-quality/client/${r.client_id}`} title={r.client_name}>
                      {r.client_name}
                    </Link>
                  </td>
                  <td className="hidden text-cp-ink-2 md:table-cell">
                    {r.periodicity ? PERIODICITY_LABEL[r.periodicity] : "—"}
                  </td>
                  <td className="hidden truncate pr-2 text-cp-ink-2 lg:table-cell">
                    {r.channel ?? "—"}
                  </td>
                  <td className="hidden text-cp-ink-2 md:table-cell">
                    {formatShortDate(r.last_received)}
                  </td>
                  <td className="hidden truncate text-cp-ink-2 lg:table-cell">
                    {r.alert_type ? ALERT_META[r.alert_type].label : "—"}
                  </td>
                  <td
                    className="text-right"
                    style={{
                      color: r.severity === "critical" ? sev.color : undefined,
                      fontWeight: r.days_late ? 600 : 400
                    }}
                  >
                    {r.days_late || "—"}
                  </td>
                  <td className="hidden text-right text-cp-ink-2 md:table-cell">
                    {formatNumber(r.received_files)}/{formatNumber(r.expected_files)}
                  </td>
                  <td className="text-right font-semibold text-cp-ink">{r.missing_files || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-[32px] text-center text-[15px] text-cp-ink-3">
            No hay clientes para este filtro.
          </p>
        )}
      </div>
      <div className="pt-[10px] text-[14px] text-cp-ink-3">
        {formatNumber(rows.length)} {plural(rows.length, "cliente", "clientes")}
      </div>
    </Modal>
  );
}
