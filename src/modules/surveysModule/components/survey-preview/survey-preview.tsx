"use client";

import { Calendar, ChevronDown, ChevronLeft, MapPin } from "lucide-react";

import type { IVisitFormQuestion } from "@/types/surveys/ISurveys";
import { cn } from "@/utils/utils";

import type { ISurveyDraft } from "../../hooks/useSurveyEditor";

interface SurveyPreviewProps {
  draft: ISurveyDraft;
  selectedId: string | null;
  onSelect: (questionId: string) => void;
}

const BOX =
  "flex h-10 w-full items-center rounded-[10px] border border-[#e3e3e3] px-3 text-xs text-[#8a8a8a]";

/** Control de cada tipo como lo pinta la app, sin respuesta. */
function PreviewControl({ question }: { question: IVisitFormQuestion }) {
  const v = question.validation ?? {};
  switch (question.type) {
    case "text":
    case "number":
    case "document":
    case "email":
    case "phone":
      return <span className={BOX}>{question.placeholder}</span>;
    case "textarea":
      return (
        <span className={cn(BOX, "h-[72px] flex-col items-stretch justify-between py-2.5")}>
          <span>{question.placeholder}</span>
          <span className="self-end text-[10px]">0 / {v.max_length ?? 5000}</span>
        </span>
      );
    case "dropdown":
      return (
        <span className={cn(BOX, "justify-between")}>
          Selecciona una opción
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      );
    case "single_select":
    case "multi_select":
      return (
        <span className="flex flex-wrap gap-1.5">
          {(question.options ?? []).map((o) => (
            <span
              key={o.id}
              className="inline-flex h-8 items-center gap-[7px] rounded-full border border-[#e3e3e3] px-3 text-xs text-[#141414]"
            >
              <i
                className={cn(
                  "h-3 w-3 border-[1.5px] border-[#a3a3a3]",
                  question.type === "multi_select" ? "rounded-[3px]" : "rounded-full"
                )}
              />
              {o.label || "Opción"}
            </span>
          ))}
        </span>
      );
    case "date":
      return (
        <span className={cn(BOX, "justify-between")}>
          DD/MM/AAAA
          <Calendar className="h-3.5 w-3.5" />
        </span>
      );
    case "location":
      return (
        <span className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#ff6a13] text-xs font-semibold text-[#ff6a13]">
          <MapPin className="h-[15px] w-[15px]" />
          Capturar ubicación
        </span>
      );
    case "photo":
    case "file":
      return (
        <span className="flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[#d6d6d6] text-xs font-semibold text-[#141414]">
          <span className="text-[#ff6a13]">+</span>
          {question.type === "photo" ? "Tomar foto" : "Adjuntar archivo"}
          <span className="font-normal text-[#8a8a8a]">· 0 de {v.max_files ?? 1}</span>
        </span>
      );
    default:
      return null;
  }
}

/** Cómo ve la encuesta el asesor en la app. Tocar una pregunta la selecciona en el editor. */
export default function SurveyPreview({ draft, selectedId, onSelect }: SurveyPreviewProps) {
  const total = draft.questions.length;
  const selectedIndex = draft.questions.findIndex((q) => q.id === selectedId);
  const step = selectedIndex < 0 ? 1 : selectedIndex + 1;
  const required = draft.questions.filter((q) => q.required).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[11.5px] font-medium text-[#8a8a8a]">Vista previa · app del asesor</p>

      <div className="flex max-h-[min(760px,calc(100*var(--vh)-180px))] w-[340px] max-w-full flex-col overflow-hidden rounded-[36px] border border-[#e3e3e3] bg-white shadow-[0_20px_50px_rgba(0,0,0,.08)]">
        <div className="px-4 pt-[18px]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#f2f2f2]">
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#141414]">
                {draft.name.trim() || "Encuesta sin título"}
              </div>
              <div className="text-[11px] text-[#2b4a5f]">Cliente de ejemplo</div>
            </div>
            <span className="rounded-full bg-[#f2f2f2] px-[9px] py-[3px] text-[11px] font-semibold text-[#141414]">
              {total ? `${step}/${total}` : "0/0"}
            </span>
          </div>
          <div className="relative -mx-4 mt-3 h-0.5 bg-[#ececec]">
            <i
              className="absolute inset-y-0 left-0 bg-[#ff6a13]"
              style={{ width: total ? `${(step / total) * 100}%` : "0%" }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {draft.description && (
            <p className="text-[11.5px] leading-normal text-[#6b6b6b]">{draft.description}</p>
          )}
          {required > 0 && (
            <p className="mb-1 mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#ff6a13]">
              <i className="h-[5px] w-[5px] rounded-full bg-[#ff6a13]" />
              Faltan {required} obligatorias
            </p>
          )}
          {draft.questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(q.id)}
              className={cn(
                "-mx-1.5 flex w-[calc(100%+12px)] flex-col rounded-lg border-b border-[#f0f0f0] px-1.5 py-3 text-left",
                q.id === selectedId && "bg-[#f4f9d2]"
              )}
            >
              <span className="text-[12.5px] font-semibold leading-[1.35] text-[#141414]">
                <span className="mr-1 text-[#a3a3a3]">{i + 1}</span>
                {q.label || "Pregunta sin título"}
                {q.required && <span className="text-[#ff6a13]"> *</span>}
              </span>
              {q.description && (
                <span className="mt-px text-[10.5px] text-[#8a8a8a]">{q.description}</span>
              )}
              <span className="mt-2 block w-full">
                <PreviewControl question={q} />
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 border-t border-[#f0f0f0] px-3.5 pb-[18px] pt-2.5">
          <span className="flex h-10 items-center rounded-full border border-[#e3e3e3] px-[18px] text-[12.5px] font-semibold text-[#141414]">
            Guardar
          </span>
          <span className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#efefe9] text-[12.5px] font-semibold text-[#a3a3a3]">
            Finalizar form
          </span>
        </div>
      </div>
    </div>
  );
}
