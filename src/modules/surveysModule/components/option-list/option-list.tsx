"use client";

import { useEffect, useRef, useState } from "react";
import { Input, type InputRef } from "antd";
import { Plus, X } from "lucide-react";

import type { IVisitFormQuestion } from "@/types/surveys/ISurveys";
import { cn } from "@/utils/utils";

import type { SurveyEditor } from "../../hooks/useSurveyEditor";

interface OptionListProps {
  question: IVisitFormQuestion;
  editor: SurveyEditor;
}

/** Opciones de una pregunta de selección. Enter agrega otra debajo y sigue escribiendo en ella. */
export default function OptionList({ question, editor }: OptionListProps) {
  const inputs = useRef(new Map<string, InputRef>());
  const [focusId, setFocusId] = useState<string | null>(null);
  const options = question.options ?? [];

  useEffect(() => {
    if (!focusId) return;
    inputs.current.get(focusId)?.focus();
    setFocusId(null);
  }, [focusId]);

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option, i) => (
        <div key={option.id} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-semibold text-muted-foreground",
              question.type === "dropdown"
                ? ""
                : question.type === "multi_select"
                  ? "rounded border border-[#c4c4c4]"
                  : "rounded-full border border-[#c4c4c4]"
            )}
          >
            {question.type === "dropdown" ? i + 1 : ""}
          </span>
          <Input
            ref={(el) => {
              if (el) inputs.current.set(option.id, el);
              else inputs.current.delete(option.id);
            }}
            value={option.label}
            placeholder={`Opción ${i + 1}`}
            onChange={(e) => editor.updateOption(question.id, option.id, e.target.value)}
            onPressEnter={() => setFocusId(editor.addOption(question.id, i))}
          />
          <button
            type="button"
            title="Quitar opción"
            aria-label="Quitar opción"
            disabled={options.length <= 1}
            onClick={() => editor.removeOption(question.id, option.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#efefef] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => editor.addOption(question.id)}
        className="flex h-8 w-fit items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[#efefef]"
      >
        <Plus className="h-4 w-4" />
        Agregar opción
      </button>
    </div>
  );
}
