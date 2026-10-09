import { Metadata } from "next";
import TicketsLayout from "@/modules/ticketsModule/containers/tickets-layout/tickets-layout";

export const metadata: Metadata = {
  title: "Tickets",
  description: "Bandeja de tickets de cartera"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TicketsLayout>{children}</TicketsLayout>;
}
