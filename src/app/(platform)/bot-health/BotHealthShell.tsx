"use client";
import { ReactNode } from "react";
import { useTranslations } from "use-intl";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

// El layout es de servidor (exporta metadata); el título del header se traduce aquí.
export default function BotHealthShell({ children }: { children?: ReactNode }) {
  const t = useTranslations("botHealth");
  return <ViewWrapper headerTitle={t("headerTitle")}>{children}</ViewWrapper>;
}
