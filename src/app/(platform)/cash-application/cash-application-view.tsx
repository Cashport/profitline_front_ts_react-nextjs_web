"use client";

import { useTranslations } from "use-intl";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

/** Marco de la vista con el título traducido (el layout es de servidor por `metadata`). */
export default function CashApplicationView({ children }: { children: React.ReactNode }) {
  const t = useTranslations("clients.cashApplicationPage");
  return <ViewWrapper headerTitle={t("title")}>{children}</ViewWrapper>;
}
