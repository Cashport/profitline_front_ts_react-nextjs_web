import SurveyEditorView from "@/modules/surveysModule/containers/survey-editor-view/survey-editor-view";

export default function SurveyDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  // ?edit=1 (lápiz del listado) abre directo en el editor.
  return <SurveyEditorView formId={Number(params.id)} startInEdit={searchParams.edit === "1"} />;
}
