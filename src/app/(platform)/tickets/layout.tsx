import TicketsLayout from "@/modules/ticketsModule/containers/tickets-layout/tickets-layout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("tasks");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TicketsLayout>{children}</TicketsLayout>;
}
