import BlockingAlertDetailView from "@/modules/blockingAlerts/containers/blocking-alert-detail-view/blocking-alert-detail-view";

export default function BlockingAlertPointOfSalePage({
  params
}: {
  params: { clientId: string; shipToCode: string };
}) {
  return <BlockingAlertDetailView clientId={params.clientId} shipToCode={params.shipToCode} />;
}
