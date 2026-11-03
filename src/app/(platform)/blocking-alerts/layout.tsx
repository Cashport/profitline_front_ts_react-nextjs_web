import BlockingAlertsLayout from "@/modules/blockingAlerts/containers/blocking-alerts-layout/blocking-alerts-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("blockingAlerts");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BlockingAlertsLayout>{children}</BlockingAlertsLayout>;
}
