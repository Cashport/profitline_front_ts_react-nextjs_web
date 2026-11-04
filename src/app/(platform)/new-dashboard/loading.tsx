"use client";
import { useTranslations } from "use-intl";

export default function Loading() {
  const t = useTranslations("common");
  return <div>{t("status.loading")}</div>;
}
