import NotificationsShell from "./NotificationsShell";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("notifications");
const NotificationLayout = ({ children }: { children: React.ReactNode }) => {
  return <NotificationsShell>{children}</NotificationsShell>;
};
export default NotificationLayout;
