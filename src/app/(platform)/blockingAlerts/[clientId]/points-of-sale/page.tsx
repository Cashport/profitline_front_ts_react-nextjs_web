import BlockingAlertsView from "@/modules/blockingAlerts/containers/blocking-alerts-view/blocking-alerts-view";

export default function BlockingAlertPointsOfSalePage({
  params
}: {
  params: { clientId: string };
}) {
  return <BlockingAlertsView clientId={params.clientId} />;
}
