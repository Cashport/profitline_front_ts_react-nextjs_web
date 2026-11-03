import { NotificationsView } from "@/components/organisms/projects/NotificationsView/NotificationsView";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("notifications");

export default function Notification() {
  return <NotificationsView />;
}
