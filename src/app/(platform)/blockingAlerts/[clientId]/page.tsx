import BlockingAlertDetailView from "@/modules/blockingAlerts/containers/blocking-alert-detail-view/blocking-alert-detail-view";

export default function BlockingAlertClientPage({ params }: { params: { clientId: string } }) {
  return <BlockingAlertDetailView clientId={params.clientId} />;
}
