"use client";

import { Eye, EyeOff, Pencil, Table2 } from "lucide-react";
import { useTranslations } from "use-intl";

import Header from "@/components/organisms/header";
import type { IVisitFormStatus } from "@/types/surveys/ISurveys";

import ActionButton from "../shared/action-button";
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
  const t = useTranslations("surveys.editorHeader");
  const tCommon = useTranslations("common");
  const title = name.trim() || (isNew ? t("newSurvey") : t("untitled"));

  const narrowPreview = (
    <ActionButton className="lg:hidden" icon={<Eye />} onClick={onOpenPreview}>
      {t("preview")}
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
          {previewOpen ? t("hidePreview") : t("preview")}
        </ActionButton>
        {narrowPreview}
        <ActionButton onClick={onExit}>
          {isNew ? tCommon("actions.cancel") : t("exitEditor")}
        </ActionButton>
        <ActionButton
          variant="primary"
          loading={isSaving}
          disabled={!isReady || (!isNew && !isDirty)}
          onClick={onPublish}
        >
          {isNew ? t("publish") : isDirty ? t("publishChanges") : t("published")}
        </ActionButton>
      </>
    ) : (
      <>
        {narrowPreview}
        <ActionButton disabled={!isReady} icon={<Table2 />} onClick={onAnswers}>
          {t("viewResponses")}
        </ActionButton>
        <ActionButton variant="primary" disabled={!isReady} icon={<Pencil />} onClick={onEdit}>
          {tCommon("actions.edit")}
        </ActionButton>
      </>
    );

  return (
    <Header
      title={title}
      onBack={onBack}
      titleExtra={!isNew && isReady ? <SurveyStatus status={status} /> : null}
      actionsExtra={actions}
    />
  );
}
