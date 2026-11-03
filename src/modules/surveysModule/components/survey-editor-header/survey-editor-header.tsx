"use client";

import { Eye, EyeOff, Pencil, Table2 } from "lucide-react";

import type { IVisitFormStatus } from "@/types/surveys/ISurveys";

import ActionButton from "../shared/action-button";
import SurveyPageHeader from "../survey-page-header/survey-page-header";
import SurveyStatus from "../survey-status/survey-status";

interface SurveyEditorHeaderProps {
  mode: "view" | "edit";
  isNew: boolean;
  name: string;
  status: IVisitFormStatus;
  isDirty: boolean;
  isSaving: boolean;
  /** Mientras llega la encuesta no hay nada que editar ni publicar. */
  isReady: boolean;
  previewOpen: boolean;
  onBack: () => void;
  /** Muestra u oculta la columna de vista previa (pantallas anchas). */
  onTogglePreview: () => void;
  /** Abre la vista previa en un panel (pantallas angostas, donde no cabe la columna). */
  onOpenPreview: () => void;
  onExit: () => void;
  onPublish: () => void;
  onEdit: () => void;
  onAnswers: () => void;
}

/** Encabezado del detalle: en lectura lleva a respuestas y al editor; en edición, vista previa y publicar. */
export default function SurveyEditorHeader({
  mode,
  isNew,
  name,
  status,
  isDirty,
  isSaving,
  isReady,
  previewOpen,
  onBack,
  onTogglePreview,
  onOpenPreview,
  onExit,
  onPublish,
  onEdit,
  onAnswers
}: SurveyEditorHeaderProps) {
  const title = name.trim() || (isNew ? "Nueva encuesta" : "Encuesta sin título");

  const narrowPreview = (
    <ActionButton className="lg:hidden" icon={<Eye />} onClick={onOpenPreview}>
      Vista previa
    </ActionButton>
  );

  const actions =
    mode === "edit" ? (
      <>
        <ActionButton
          className="hidden lg:flex"
          icon={previewOpen ? <EyeOff /> : <Eye />}
          onClick={onTogglePreview}
        >
          {previewOpen ? "Ocultar vista previa" : "Vista previa"}
        </ActionButton>
        {narrowPreview}
        <ActionButton onClick={onExit}>{isNew ? "Cancelar" : "Salir del editor"}</ActionButton>
        <ActionButton
          variant="primary"
          loading={isSaving}
          disabled={!isReady || (!isNew && !isDirty)}
          onClick={onPublish}
        >
          {isNew ? "Publicar" : isDirty ? "Publicar cambios" : "Publicada"}
        </ActionButton>
      </>
    ) : (
      <>
        {narrowPreview}
        <ActionButton disabled={!isReady} icon={<Table2 />} onClick={onAnswers}>
          Ver respuestas
        </ActionButton>
        <ActionButton variant="primary" disabled={!isReady} icon={<Pencil />} onClick={onEdit}>
          Editar
        </ActionButton>
      </>
    );

  return (
    <SurveyPageHeader
      backHref="/surveys"
      backLabel="Encuestas"
      onBack={onBack}
      title={title}
      titleExtra={!isNew && isReady ? <SurveyStatus status={status} /> : null}
      actions={actions}
    />
  );
}
