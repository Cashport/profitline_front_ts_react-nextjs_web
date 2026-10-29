"use client";

import { useState, type HTMLAttributes } from "react";
import { GripVertical, Plus } from "lucide-react";

import type { IVisitFormQuestionType } from "@/types/surveys/ISurveys";

import { QUESTION_TYPE_ORDER, QUESTION_TYPES } from "../../constants";

interface AddQuestionMenuProps {
  /** Número de la pregunta seleccionada: la nueva va debajo. Sin selección va al final. */
  selectedNumber: number | null;
  onAdd: (type: IVisitFormQuestionType) => void;
  /** Soltar aquí deja la pregunta arrastrada al final. */
  dropZone?: HTMLAttributes<HTMLDivElement>;
  showDropLine?: boolean;
}

/** "Agregar pregunta" con el menú de tipos y la ayuda de reordenar. */
export default function AddQuestionMenu({
  selectedNumber,
  onAdd,
  dropZone,
  showDropLine
}: AddQuestionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div {...dropZone} className="relative flex flex-col gap-3">
      {showDropLine && (
        <div className="absolute -top-2 left-3 right-3 h-0.5 rounded bg-[#1677ff]" />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-foreground transition-colors hover:border-[#9bb514]"
      >
        <Plus className="h-4 w-4" />
        Agregar pregunta
      </button>

      {open && (
        <div className="rounded-xl bg-card p-3 shadow-sm">
          <p className="mb-2 text-xs text-muted-foreground">
            {selectedNumber
              ? `Se agrega debajo de la pregunta ${selectedNumber}`
              : "Se agrega al final"}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
            {QUESTION_TYPE_ORDER.map((type) => {
              const { label, hint, Icon } = QUESTION_TYPES[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onAdd(type);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-[#fafafa] px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:border-[#9bb514] hover:bg-card"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-card">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <span className="text-[#e0007a]">*</span> Obligatoria · arrastra{" "}
        <GripVertical className="inline h-3.5 w-3.5 align-text-bottom" /> para reordenar
      </p>
    </div>
  );
}
