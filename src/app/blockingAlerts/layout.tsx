import { Metadata } from "next";
import BlockingAlertsLayout from "@/modules/blockingAlerts/containers/blocking-alerts-layout/blocking-alerts-layout";

export const metadata: Metadata = {
  title: "Alertas de bloqueo",
  description: "Clientes y puntos de venta bloqueados o por bloquear por cartera vencida"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BlockingAlertsLayout>{children}</BlockingAlertsLayout>;
}
