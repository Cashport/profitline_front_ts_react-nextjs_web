"use client";

import { useTranslations } from "use-intl";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

/** Marco de la pantalla de Saldos: el título se traduce en el cliente (el layout es de servidor). */
export function BalancesLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("balances");
  return <ViewWrapper headerTitle={t("title")}>{children}</ViewWrapper>;
}
