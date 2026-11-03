"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Drawer } from "antd";

import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ProfitLoader from "@/components/ui/profit-loader";
import { useUnsavedChangesAlert } from "@/modules/purchaseOrders/hooks/useUnsavedChangesAlert";
import { cn } from "@/utils/utils";

import AddQuestionMenu from "../../components/add-question-menu/add-question-menu";
import QuestionCard from "../../components/question-card/question-card";
import SurveyEditorHeader from "../../components/survey-editor-header/survey-editor-header";
import SurveyMeta from "../../components/survey-meta/survey-meta";
import SurveyPreview from "../../components/survey-preview/survey-preview";
import { useQuestionDrag } from "../../hooks/useQuestionDrag";
import { useSurveyEditor } from "../../hooks/useSurveyEditor";

interface SurveyEditorViewProps {
  /** Sin id es una encuesta nueva (/surveys/new). */
  formId?: number;
  /** ?edit=1: abre directo en el editor. */
  startInEdit?: boolean;
}

/**
 * Una encuesta (/surveys/:id) o una nueva (/surveys/new). El detalle abre en
 * lectura y "Editar" lo vuelve editor en el mismo lugar; no hay autoguardado:
 * nada se guarda hasta "Publicar", que crea la encuesta o publica una versión.
 */
export default function SurveyEditorView({ formId, startInEdit = false }: SurveyEditorViewProps) {
  const router = useRouter();
  const isNew = formId === undefined;
  const editor = useSurveyEditor(formId);
  const drag = useQuestionDrag(editor.moveQuestion);
  const [mode, setMode] = useState<"view" | "edit">(isNew || startInEdit ? "edit" : "view");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const isEdit = mode === "edit";
  const unsaved = useUnsavedChangesAlert(isEdit && editor.isDirty);

  const { draft, form } = editor;
  const isReady = isNew || Boolean(form);

  const handlePublish = async () => {
    const saved = await editor.publish();
    if (!saved) return;
    if (isNew) router.replace(`/surveys/${saved.id}`);
    else setMode("view");
  };

  const exitEditor = () => {
    if (isNew) unsaved.attemptNavigation("/surveys");
    else if (editor.isDirty) setConfirmExit(true);
    else setMode("view");
  };

  const renderBody = () => {
    if (!isNew && editor.isLoading) return <ProfitLoader size="small" />;
    if (!isReady) {
      return (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-9 text-center shadow-sm">
          <p className="text-sm text-destructive">
            {editor.error?.message || "No se encontró la encuesta."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/surveys")}
            className="text-[13px] font-medium text-[#1677ff] hover:underline"
          >
            Volver a Encuestas
          </button>
        </div>
      );
    }

    const selectedIndex = draft.questions.findIndex((q) => q.id === editor.selectedId);
    const showPreview = !isEdit || previewOpen;

    return (
      <div
        className={cn(
          "grid items-start gap-4",
          showPreview && "lg:grid-cols-[minmax(0,1fr)_360px]"
        )}
      >
        <section className="flex min-w-0 flex-col gap-3">
          {editor.errors.length > 0 && (
            <Alert
              type="error"
              showIcon
              closable
              onClose={editor.clearErrors}
              message="La encuesta no se publicó"
              description={
                <ul className="list-disc pl-4">
                  {editor.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              }
            />
          )}

          <SurveyMeta editor={editor} isEdit={isEdit} />

          {draft.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={draft.questions.length}
              editor={editor}
              isEdit={isEdit}
              dragHandle={drag.handleProps(q.id)}
              dropZone={isEdit ? drag.dropProps(i) : undefined}
              showDropLine={drag.dragId !== null && drag.dragId !== q.id && drag.overIndex === i}
            />
          ))}

          {isEdit && (
            <AddQuestionMenu
              selectedNumber={selectedIndex >= 0 ? selectedIndex + 1 : null}
              onAdd={editor.addQuestion}
              dropZone={drag.dropProps(draft.questions.length)}
              showDropLine={drag.dragId !== null && drag.overIndex === draft.questions.length}
            />
          )}
        </section>

        {showPreview && (
          <aside className="sticky top-4 hidden lg:block">
            <SurveyPreview draft={draft} selectedId={editor.selectedId} onSelect={editor.select} />
          </aside>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6">
      <SurveyEditorHeader
        mode={mode}
        isNew={isNew}
        name={draft.name}
        status={draft.status}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        isReady={isReady}
        previewOpen={previewOpen}
        onBack={() => unsaved.attemptNavigation("/surveys")}
        onTogglePreview={() => setPreviewOpen((open) => !open)}
        onOpenPreview={() => setDrawerOpen(true)}
        onExit={exitEditor}
        onPublish={handlePublish}
        onEdit={() => setMode("edit")}
        onAnswers={() => router.push(`/surveys/${formId}/answers`)}
      />

      {renderBody()}

      <Drawer
        title="Vista previa"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        styles={{ wrapper: { maxWidth: "100%" } }}
      >
        <SurveyPreview draft={draft} selectedId={editor.selectedId} onSelect={editor.select} />
      </Drawer>

      <ModalConfirmAction
        isOpen={unsaved.showUnsavedModal}
        onClose={unsaved.cancelNavigation}
        onOk={async () => {
          if (await editor.publish()) unsaved.confirmNavigation();
        }}
        onCancel={unsaved.confirmNavigation}
        title="Cambios sin publicar"
        content="Tienes cambios sin publicar. ¿Quieres publicarlos antes de salir?"
        okText="Publicar"
        cancelText="Descartar"
        okLoading={editor.isSaving}
      />

      <ModalConfirmAction
        isOpen={confirmExit}
        onClose={() => setConfirmExit(false)}
        onOk={() => {
          editor.discard();
          setConfirmExit(false);
          setMode("view");
        }}
        title="¿Salir sin publicar?"
        content="Los cambios que no publicaste se pierden."
        okText="Salir"
        cancelText="Seguir editando"
      />
    </div>
  );
}
