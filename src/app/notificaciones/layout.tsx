import { Metadata } from "next";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

export const metadata: Metadata = {
  title: "Notificaciones",
  description: "notificaciones por usuario"
};
const NotificationLayout = ({ children }: { children: React.ReactNode }) => {
  return <ViewWrapper headerTitle="Notificaciones">{children}</ViewWrapper>;
};
export default NotificationLayout;
