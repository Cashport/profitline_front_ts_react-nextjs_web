"use client";

import GenericEyeButton from "@/components/ui/generic-eye-button";
import StatusPill from "@/modules/visitsModule/components/shared/status-pill";
import type { IVisitFormResponseListItem } from "@/types/surveys/ISurveys";
import { cn, formatDateAndTime } from "@/utils/utils";

import { RESPONSE_STATUS } from "../../constants";

interface ResponsesTableProps {
  responses: IVisitFormResponseListItem[];
  onOpen: (responseId: number) => void;
}

const TH =
  "border-b border-cp-line bg-cp-surface px-3 py-3 text-left text-[13.5px] font-semibold text-cp-ink";

/** La fecha de una respuesta: la de cierre, o la del último guardado si quedó parcial. */
const responseDate = (r: IVisitFormResponseListItem) =>
  formatDateAndTime(r.completed_at ?? r.updated_at);

/**
 * Respuestas de la encuesta: tabla en escritorio y tarjetas en pantallas
 * angostas. Ciudad va vacía: el backend todavía no la manda.
 */
export default function ResponsesTable({ responses, onOpen }: ResponsesTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={TH}>
                Fecha
              </th>
              <th scope="col" className={TH}>
                Asesor
              </th>
              <th scope="col" className={TH}>
                Cliente
              </th>
              <th scope="col" className={cn(TH, "hidden lg:table-cell")}>
                Ciudad
              </th>
              <th scope="col" className={TH}>
                Estado
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Ver
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr
                key={r.response_id}
                onClick={() => onOpen(r.response_id)}
                className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
              >
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                  {responseDate(r)}
                </td>
                <td className="px-3 py-2.5 text-foreground">{r.user_name ?? "—"}</td>
                <td className="max-w-[320px] px-3 py-2">
                  <span className="block truncate font-medium text-[#1677ff]">
                    {r.client_name ?? "—"}
                  </span>
                  {r.client_nit && (
                    <span className="block text-[13px] text-muted-foreground">
                      NIT {r.client_nit}
                    </span>
                  )}
                </td>
                <td className="hidden px-3 py-2.5 text-muted-foreground lg:table-cell">—</td>
                <td className="px-3 py-2.5">
                  <StatusPill
                    label={RESPONSE_STATUS[r.status].label}
                    color={RESPONSE_STATUS[r.status].color}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <GenericEyeButton onClick={() => onOpen(r.response_id)} title="Ver respuesta" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {responses.map((r) => (
          <button
            key={r.response_id}
            type="button"
            onClick={() => onOpen(r.response_id)}
            className="flex flex-col gap-1 rounded-xl border border-border px-3.5 py-3 text-left"
          >
            <span className="truncate text-[13.5px] font-semibold text-[#1677ff]">
              {r.client_name ?? "—"}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span>{responseDate(r)}</span>
              <span>{r.user_name ?? "—"}</span>
              <StatusPill
                label={RESPONSE_STATUS[r.status].label}
                color={RESPONSE_STATUS[r.status].color}
              />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
