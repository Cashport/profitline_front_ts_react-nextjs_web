"use client";

import { usePathname } from "next/navigation";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

const MEDICAL_ACCOUNTS_PATH = "/cuentas-medicas";

interface MedicalAccountsLayoutProps {
  children: React.ReactNode;
}

/**
 * Marco de /cuentas-medicas (listado y detalle). En el detalle el header
 * muestra "‹" para volver al listado (docs/DESIGN.md §4).
 */
export function MedicalAccountsLayout({ children }: MedicalAccountsLayoutProps) {
  const isList = usePathname() === MEDICAL_ACCOUNTS_PATH;

  return (
    <ViewWrapper
      headerTitle="Cuentas Médicas"
      headerBack={isList ? undefined : MEDICAL_ACCOUNTS_PATH}
    >
      {children}
    </ViewWrapper>
  );
}
