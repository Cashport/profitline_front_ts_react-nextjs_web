"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Input, Select, Switch } from "antd";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";

import type { IVisitFormQuestion } from "@/types/surveys/ISurveys";
import { cn } from "@/utils/utils";

import { OPTION_TYPES, QUESTION_TYPE_ORDER, QUESTION_TYPES } from "../../constants";
import type { SurveyEditor } from "../../hooks/useSurveyEditor";
import OptionList from "../option-list/option-list";
import QuestionConfigFields from "../question-config-fields/question-config-fields";

interface QuestionCardProps {
  question: IVisitFormQuestion;
  index: number;
  total: number;
  editor: SurveyEditor;
  isEdit: boolean;
  /** Asa para arrastrar y zona donde se suelta (solo en edición). */
  dragHandle?: HTMLAttributes<HTMLSpanElement>;
  dropZone?: HTMLAttributes<HTMLDivElement>;
  showDropLine?: boolean;
}

/** Regla que se muestra bajo el título cuando la pregunta no tiene texto de ayuda. */
const rule = (q: IVisitFormQuestion) => {
  const v = q.validation ?? {};
  if (q.type === "photo") return `Hasta ${v.max_files ?? 1} fotos`;
  if (q.type === "file") {
    const formats = (v.allowed_file_types ?? []).map((ext) => ext.slice(1).toUpperCase());
    return `${formats.join(", ") || "Cualquier formato"} · hasta ${v.max_files ?? 1} archivos${
      v.max_file_size_mb ? ` de ${v.max_file_size_mb} MB` : ""
    }`;
  }
  if (q.type === "multi_select" && v.max_selections) return `Máximo ${v.max_selections} opciones`;
  return "";
};

/** Resumen de la configuración, a la derecha de la fila. */
const summary = (q: IVisitFormQuestion) => {
  const v = q.validation ?? {};
  switch (q.type) {
    case "text":
    case "textarea":
      return v.max_length ? `Máx. ${v.max_length} caracteres` : "";
    case "document":
    case "phone":
      if (!v.min_length && !v.max_length) return "";
      return v.min_length && v.max_length
        ? `${v.min_length}–${v.max_length} dígitos`
        : v.max_length
          ? `Hasta ${v.max_length} dígitos`
          : `Desde ${v.min_length} dígitos`;
    case "number":
      if (v.min_value !== undefined && v.max_value !== undefined)
        return `${v.min_value} a ${v.max_value}`;
      if (v.max_value !== undefined) return `Hasta ${v.max_value}`;
      return v.min_value !== undefined ? `Desde ${v.min_value}` : "";
    case "single_select":
    case "dropdown":
    case "multi_select":
      return `${q.options?.length ?? 0} opciones`;
    case "photo":
      return `Hasta ${v.max_files ?? 1} fotos`;
    case "file":
      return v.max_file_size_mb
        ? `${v.max_files ?? 1} × ${v.max_file_size_mb} MB`
        : `${v.max_files ?? 1} archivos`;
    default:
      return "";
  }
};

function IconButton({
  title,
  danger,
  disabled,
  onClick,
  children
}: {
  title: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "hover:text-[#e0007a]" : "hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Una pregunta. Cerrada muestra el resumen; seleccionada en edición se
 * convierte en su editor (texto, tipo, opciones, configuración y acciones).
 */
export default function QuestionCard({
  question,
  index,
  total,
  editor,
  isEdit,
  dragHandle,
  dropZone,
  showDropLine
}: QuestionCardProps) {
  const isSelected = editor.selectedId === question.id;
  const isOpen = isEdit && isSelected;
  const { label: typeLabel, Icon } = QUESTION_TYPES[question.type];
  const subLine = question.description || rule(question);

  const grip = isEdit && (
    <span
      {...dragHandle}
      title="Arrastrar para reordenar"
      className="flex shrink-0 cursor-grab items-center text-muted-foreground active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </span>
  );
  const number = (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
      {index + 1}
    </span>
  );

  return (
    <div
      {...dropZone}
      onClick={() => editor.select(question.id)}
      className={cn(
        "relative rounded-xl border bg-card px-[18px] shadow-sm transition-colors",
        isOpen ? "py-4" : "py-3.5",
        isSelected
          ? "border-[#cbe71e] ring-[3px] ring-[#cbe71e]/35"
          : "border-transparent hover:border-border"
      )}
    >
      {showDropLine && (
        <div className="absolute -top-2 left-3 right-3 h-0.5 rounded bg-[#1677ff]" />
      )}

      {isOpen ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {grip}
            {number}
            <Input
              autoFocus={!question.label}
              value={question.label}
              placeholder="Escribe la pregunta"
              onChange={(e) => editor.updateQuestion(question.id, { label: e.target.value })}
              className="min-w-[200px] flex-1"
            />
            <Select
              value={question.type}
              onChange={(type) => editor.changeType(question.id, type)}
              popupMatchSelectWidth={false}
              className="w-[210px]"
              options={QUESTION_TYPE_ORDER.map((type) => {
                const meta = QUESTION_TYPES[type];
                return {
                  value: type,
                  label: (
                    <span className="flex items-center gap-2">
                      <meta.Icon className="h-4 w-4 shrink-0" />
                      {meta.label}
                    </span>
                  )
                };
              })}
            />
          </div>

          <Input
            value={question.description ?? ""}
            placeholder="Texto de ayuda (opcional)"
            onChange={(e) =>
              editor.updateQuestion(question.id, { description: e.target.value || null })
            }
          />

          {OPTION_TYPES.includes(question.type) && (
            <OptionList question={question} editor={editor} />
          )}
          <QuestionConfigFields question={question} editor={editor} />

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <IconButton
                title="Subir"
                disabled={index === 0}
                onClick={() => editor.moveBy(question.id, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                title="Bajar"
                disabled={index === total - 1}
                onClick={() => editor.moveBy(question.id, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </IconButton>
              <IconButton title="Duplicar" onClick={() => editor.duplicateQuestion(question.id)}>
                <Copy className="h-4 w-4" />
              </IconButton>
              <IconButton
                title="Eliminar"
                danger
                onClick={() => editor.removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
              Obligatoria
              <Switch
                size="small"
                checked={question.required}
                onChange={(required) => editor.updateQuestion(question.id, { required })}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {grip}
          {number}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-medium text-foreground">
              {question.label || <span className="text-muted-foreground">Pregunta sin título</span>}
              {question.required && <span className="text-[#e0007a]"> *</span>}
            </div>
            {subLine && <div className="truncate text-xs text-muted-foreground">{subLine}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {question.visible_if && (
              <span
                title="Se muestra según la respuesta de otra pregunta"
                className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground"
              >
                Condicional
              </span>
            )}
            <span className="hidden sm:inline">{summary(question)}</span>
            <span className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground">
              <Icon className="h-3.5 w-3.5" />
              {typeLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
