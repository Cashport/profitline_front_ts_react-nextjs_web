import SurveyAnswersView from "@/modules/surveysModule/containers/survey-answers-view/survey-answers-view";

export default function SurveyAnswersPage({ params }: { params: { id: string } }) {
  return <SurveyAnswersView formId={Number(params.id)} />;
}
