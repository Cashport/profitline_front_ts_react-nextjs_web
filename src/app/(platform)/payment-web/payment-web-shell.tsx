"use client";
import { useTranslations } from "use-intl";
import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

// El layout es un componente de servidor (exporta metadata): el título traducido se arma aquí.
export default function PaymentWebShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("publicPortals.paymentWeb");
  return <ViewWrapper headerTitle={t("headerTitle")}>{children}</ViewWrapper>;
}
