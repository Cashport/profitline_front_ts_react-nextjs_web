import { Metadata } from "next";
import TicketsLayout from "@/modules/ticketsModule/containers/tickets-layout/tickets-layout";

export const metadata: Metadata = {
  title: "Task manager",
  description: "Gestor de tareas por proceso"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TicketsLayout>{children}</TicketsLayout>;
}
