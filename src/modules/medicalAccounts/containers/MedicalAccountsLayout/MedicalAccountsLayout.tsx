"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "use-intl";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

const MEDICAL_ACCOUNTS_PATH = "/medical-accounts";

interface MedicalAccountsLayoutProps {
  children: React.ReactNode;
}

/**
 * Marco de /cuentas-medicas (listado y detalle). En el detalle el header
 * muestra "‹" para volver al listado (docs/DESIGN.md §4).
 */
export function MedicalAccountsLayout({ children }: MedicalAccountsLayoutProps) {
  const t = useTranslations("medicalAccounts");
  const isList = usePathname() === MEDICAL_ACCOUNTS_PATH;

  return (
    <ViewWrapper headerTitle={t("title")} headerBack={isList ? undefined : MEDICAL_ACCOUNTS_PATH}>
      {children}
    </ViewWrapper>
  );
}
