"use client";

import { useTranslations } from "use-intl";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

/** Marco de /reconciliation: el título se traduce en el cliente (el layout es de servidor). */
export default function ReconciliationLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("reconciliation");
  // Pantalla de segundo nivel (se entra desde el detalle del cliente): "‹" vuelve atrás.
  return (
    <ViewWrapper headerTitle={t("title")} headerBack="/clients/all">
      {children}
    </ViewWrapper>
  );
}
