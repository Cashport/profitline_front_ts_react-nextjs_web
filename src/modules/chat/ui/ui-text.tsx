"use client";

import { useTranslations } from "use-intl";

type UiKey = Parameters<ReturnType<typeof useTranslations<"chat.ui">>>[0];

/** Texto por defecto (sr-only, títulos ocultos) de los componentes del kit de chat. */
export function UiText({ k }: { k: UiKey }) {
  const t = useTranslations("chat.ui");
  return <>{t(k)}</>;
}
