"use client";

import { Dropdown } from "antd";
import { CaretDown, DownloadSimple, LockSimple, Plus } from "phosphor-react";

import type { IClosingInfo } from "@/types/closings/IClosings";

import { formatDate, periodLabel } from "../../utils/format";

interface Props {
  closings: IClosingInfo[];
  value: string;
  onChange: (period: string) => void;
  /** Abre la carga de un cierre nuevo (al final del menú: no es la acción del día a día). */
  onLoadNew: () => void;
  /** NIT del cierre elegido que aún no existen en Clientes. */
  pendingCount: number;
  onDownloadPending: () => void;
}

const LOAD_KEY = "__load-new__";
const PENDING_KEY = "__pending__";

/**
 * Chip del cierre junto al título (mismo lugar y medida que el corte de HeaderCutoff): el
 * candado dice que la cifra es fija al corte, no un dato en vivo. El menú lista los cierres y
 * al final "Cargar nuevo cierre".
 */
export default function ClosingPicker({
  closings,
  value,
  onChange,
  onLoadNew,
  pendingCount,
  onDownloadPending
}: Props) {
  const selected = closings.find((c) => c.period === value) ?? closings[0];
  if (!selected) return null;
  const loadedAt = selected.finished_at ?? selected.created_at;

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectable: true,
        selectedKeys: [value],
        onClick: ({ key }) => {
          if (key === LOAD_KEY) onLoadNew();
          else if (key === PENDING_KEY) onDownloadPending();
          else onChange(key);
        },
        items: [
          ...closings.map((c) => ({
            key: c.period,
            label: (
              <span className="block min-w-[180px] py-0.5 text-[13px] font-medium text-cp-ink">
                {periodLabel(c.period)}
              </span>
            )
          })),
          { type: "divider" as const },
          ...(pendingCount > 0
            ? [
                {
                  key: PENDING_KEY,
                  label: (
                    <span className="flex items-center gap-2 py-0.5 text-[13px] font-medium text-cp-ink">
                      <DownloadSimple size={14} weight="bold" />
                      NIT pendientes por crear ({pendingCount.toLocaleString("es-CO")})
                    </span>
                  )
                }
              ]
            : []),
          {
            key: LOAD_KEY,
            label: (
              <span className="flex items-center gap-2 py-0.5 text-[13px] font-semibold text-cp-ink">
                <Plus size={14} weight="bold" /> Cargar nuevo cierre
              </span>
            )
          }
        ]
      }}
    >
      <button
        type="button"
        title={`Cargado el ${formatDate(loadedAt)} por ${selected.created_by_email ?? "—"}`}
        className="flex h-8 items-center gap-2 rounded-lg bg-cp-surface px-3 text-[13px] text-cp-ink-2 hover:text-cp-ink"
      >
        <LockSimple size={14} weight="bold" className="text-cp-lime-dark" />
        <span>
          Cierre{" "}
          <span className="font-semibold text-cp-ink">
            {periodLabel(selected.period).toLowerCase()}
          </span>
        </span>
        <CaretDown size={12} weight="bold" />
      </button>
    </Dropdown>
  );
}
