"use client";

import Link from "next/link";

import type { IVisitFormListItem } from "@/types/surveys/ISurveys";
import { formatDateAndTime } from "@/utils/utils";

import SurveyStatus from "../survey-status/survey-status";

const ACTION_CLASS =
  "flex h-8 items-center rounded-md border border-border px-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-[#9bb514] hover:text-foreground";

/** Fila del listado en pantallas angostas, donde la tabla no cabe. */
export default function SurveyCard({ form }: { form: IVisitFormListItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={`/surveys/${form.id}`}
          className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[#1677ff]"
        >
          {form.name}
        </Link>
        <SurveyStatus status={form.status} />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
        <span>
          <b className="font-semibold text-foreground">
            {form.response_count.toLocaleString("es-CO")}
          </b>{" "}
          respuestas
        </span>
        <span>{form.question_count} preguntas</span>
        <span>
          {form.last_response_at
            ? `Última ${formatDateAndTime(form.last_response_at)}`
            : "Sin respuestas"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/surveys/${form.id}`} className={ACTION_CLASS}>
          Visualizar
        </Link>
        <Link href={`/surveys/${form.id}?edit=1`} className={ACTION_CLASS}>
          Editar
        </Link>
        <Link href={`/surveys/${form.id}/answers`} className={ACTION_CLASS}>
          Ver respuestas
        </Link>
      </div>
    </div>
  );
}
