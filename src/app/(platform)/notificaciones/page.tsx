import { NotificationsView } from "@/components/organisms/projects/NotificationsView/NotificationsView";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Profitline"
};

export default function Notification() {
  return <NotificationsView />;
}
