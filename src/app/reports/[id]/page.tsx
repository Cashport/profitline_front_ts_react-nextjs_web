import ReportDetailView from "@/modules/reportsModule/containers/report-detail-view/report-detail-view";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return <ReportDetailView reportId={Number(params.id)} />;
}
