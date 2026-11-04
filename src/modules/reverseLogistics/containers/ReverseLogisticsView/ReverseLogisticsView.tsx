"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useTranslations } from "use-intl";
import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { DevolucionesTab } from "../../components/DevolucionesTab/DevolucionesTab";
import { AprobacionesTab } from "../../components/AprobacionesTab/AprobacionesTab";

export type ReverseLogisticsTabKey = "devoluciones" | "aprobaciones";

interface ReverseLogisticsViewProps {
  activeTab: ReverseLogisticsTabKey;
  // Optional custom content rendered inside the white card in place of the
  // default tab body. Used by the detail route (/approvals/:id) so it
  // shares the same tabs + white-card chrome as the list routes.
  children?: ReactNode;
  /** Título del header compartido (clave de `reverseLogistics.view`); por defecto el del listado. */
  titleKey?: "title" | "lotApprovalTitle";
  /** Pantallas de detalle: muestra "‹" en el header (ruta padre si se entró por URL). */
  back?: boolean | string;
}

const TABS: { key: ReverseLogisticsTabKey; labelKey: "returns" | "approvals"; href: string }[] = [
  { key: "devoluciones", labelKey: "returns", href: "/reverse-logistics/returns" },
  { key: "aprobaciones", labelKey: "approvals", href: "/reverse-logistics/approvals" }
];

// Single white card shared by every reverse-logistics route — tabs + content.
// The shared Header is rendered here (the route layout hides ViewWrapper's) so
// the detail route can show "‹" (docs/DESIGN.md §4); padding and background
// come from ViewWrapper's .rightContent. Each tab lives at its own URL
// (/reverse-logistics/returns, /reverse-logistics/approvals,
// /reverse-logistics/approvals/:id), so UiTab is driven as a router and the
// body is rendered below it rather than as tab children — that keeps the
// detail route's `children` override working.
export function ReverseLogisticsView({
  activeTab,
  children,
  titleKey = "title",
  back
}: ReverseLogisticsViewProps) {
  const router = useRouter();
  const t = useTranslations("reverseLogistics.view");

  return (
    <div className="cp-page">
      <Header title={t(titleKey)} back={back} />
      <div className="cp-card px-[18px] py-[14px]">
        <UiTab
          tabs={TABS.map((tab) => ({
            key: tab.key,
            label: t(`tabs.${tab.labelKey}`),
            children: null
          }))}
          activeKey={activeTab}
          onChangeTab={(key) => {
            const tab = TABS.find((t) => t.key === key);
            if (tab) router.push(tab.href);
          }}
        />

        {children ?? (activeTab === "devoluciones" ? <DevolucionesTab /> : <AprobacionesTab />)}
      </div>
    </div>
  );
}
