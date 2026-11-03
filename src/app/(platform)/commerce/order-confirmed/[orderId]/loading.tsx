"use client";
import { useTranslations } from "use-intl";

export default function Loading() {
  const tCommon = useTranslations("common");
  return <div>{tCommon("status.loading")}</div>;
}
