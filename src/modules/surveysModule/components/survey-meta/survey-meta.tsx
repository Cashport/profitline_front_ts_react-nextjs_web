"use client";

import { Input, Switch } from "antd";

import { fmtReportDate } from "@/modules/reportsModule/utils/reports-format";

import type { SurveyEditor } from "../../hooks/useSurveyEditor";

interface SurveyMetaProps {
  editor: SurveyEditor;
  isEdit: boolean;
}

/** Nombre, descripción y datos de la encuesta; en edición, también si está activa. */
export default function SurveyMeta({ editor, isEdit }: SurveyMetaProps) {
  const { draft, form } = editor;
  const required = draft.questions.filter((q) => q.required).length;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-sm">
      {isEdit ? (
        <>
          <Input
            size="large"
            value={draft.name}
            maxLength={255}
            placeholder="Nombre de la encuesta"
            onChange={(e) => editor.setField("name", e.target.value)}
            className="!text-xl !font-semibold"
          />
          <Input.TextArea
            value={draft.description ?? ""}
            autoSize={{ minRows: 2, maxRows: 5 }}
            placeholder="Descripción que verá el asesor al abrir la encuesta"
            onChange={(e) => editor.setField("description", e.target.value || null)}
          />
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">{draft.name}</h2>
          {draft.description && (
            <p className="text-sm text-muted-foreground">{draft.description}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <b className="font-semibold text-foreground">{draft.questions.length}</b> preguntas
        </span>
        <span>
          <b className="font-semibold text-foreground">{required}</b> obligatorias
        </span>
        {form && (
          <>
            <span>Versión {form.version}</span>
            <span>Creada por {form.created_by_name ?? "—"}</span>
            <span>Actualizada {fmtReportDate(form.updated_at)}</span>
          </>
        )}
        {isEdit && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
            <Switch
              size="small"
              checked={draft.status === "ACTIVE"}
              onChange={(on) => editor.setField("status", on ? "ACTIVE" : "INACTIVE")}
            />
            Activa
          </label>
        )}
      </div>
    </div>
  );
}
