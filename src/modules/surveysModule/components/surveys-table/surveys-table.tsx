"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import GenericEyeButton from "@/components/ui/generic-eye-button";
import { fmtReportDate } from "@/modules/reportsModule/utils/reports-format";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import type { SortState } from "@/modules/walletModule/types";
import type { IVisitFormListItem } from "@/types/surveys/ISurveys";
import { formatDateAndTime } from "@/utils/utils";

import SurveyStatus from "../survey-status/survey-status";

interface SurveysTableProps {
  forms: IVisitFormListItem[];
  sort: SortState;
  onSort: (col: string) => void;
  onOpen: (formId: number) => void;
}

// hover:text es obligatorio: el `a:hover` global de AntD pintaría el ícono de azul.
const ICON_LINK_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-[#F7F7F7] text-[#141414] transition-colors hover:border-[#141414] hover:text-[#141414]";

/** Listado en escritorio: una fila por encuesta. Las columnas secundarias se ocultan en pantallas medianas. */
export default function SurveysTable({ forms, sort, onSort, onOpen }: SurveysTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <SortableTh col="name" label="Encuesta" sort={sort} onSort={onSort} />
            <SortableTh col="status" label="Estado" sort={sort} onSort={onSort} />
            <SortableTh
              col="question_count"
              label="Preguntas"
              align="right"
              sort={sort}
              onSort={onSort}
              className="hidden lg:table-cell"
            />
            <SortableTh
              col="response_count"
              label="Respuestas"
              align="right"
              sort={sort}
              onSort={onSort}
            />
            <SortableTh
              col="last_response_at"
              label="Última respuesta"
              sort={sort}
              onSort={onSort}
              className="hidden xl:table-cell"
            />
            <SortableTh
              col="created_by_name"
              label="Creada por"
              sort={sort}
              onSort={onSort}
              className="hidden xl:table-cell"
            />
            <SortableTh
              col="updated_at"
              label="Actualizada"
              sort={sort}
              onSort={onSort}
              className="hidden lg:table-cell"
            />
            <th
              scope="col"
              className="border-b border-border bg-muted/40 px-3 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {forms.map((f) => (
            <tr
              key={f.id}
              onClick={() => onOpen(f.id)}
              className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
            >
              <td className="max-w-[360px] px-3 py-2.5">
                <span className="block truncate font-medium text-[#1677ff]">{f.name}</span>
              </td>
              <td className="px-3 py-2.5">
                <SurveyStatus status={f.status} />
              </td>
              <td className="hidden px-3 py-2.5 text-right tabular-nums text-muted-foreground lg:table-cell">
                {f.question_count}
              </td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                {f.response_count.toLocaleString("es-CO")}
              </td>
              <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground xl:table-cell">
                {f.last_response_at ? formatDateAndTime(f.last_response_at) : "—"}
              </td>
              <td className="hidden px-3 py-2.5 text-muted-foreground xl:table-cell">
                {f.created_by_name ?? "—"}
              </td>
              <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground lg:table-cell">
                {fmtReportDate(f.updated_at)}
              </td>
              <td className="px-3 py-1.5">
                <div className="flex items-center justify-end gap-1.5">
                  <GenericEyeButton href={`/surveys/${f.id}`} title="Ver encuesta" />
                  <Link
                    href={`/surveys/${f.id}?edit=1`}
                    title="Editar"
                    aria-label="Editar"
                    onClick={(e) => e.stopPropagation()}
                    className={ICON_LINK_CLASS}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/surveys/${f.id}/answers`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 items-center whitespace-nowrap rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:border-[#9bb514] hover:text-foreground"
                  >
                    Ver respuestas
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
