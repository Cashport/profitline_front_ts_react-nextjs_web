"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import UiTab from "@/components/ui/ui-tab";
import { DevolucionesTab } from "../../components/DevolucionesTab/DevolucionesTab";
import { AprobacionesTab } from "../../components/AprobacionesTab/AprobacionesTab";

export type ReverseLogisticsTabKey = "devoluciones" | "aprobaciones";

interface ReverseLogisticsViewProps {
  activeTab: ReverseLogisticsTabKey;
  // Optional custom content rendered inside the white card in place of the
  // default tab body. Used by the detail route (/aprobaciones/:id) so it
  // shares the same tabs + white-card chrome as the list routes.
  children?: ReactNode;
}

const TABS: { key: ReverseLogisticsTabKey; label: string; href: string }[] = [
  { key: "devoluciones", label: "Devoluciones", href: "/logistica-inversa/devoluciones" },
  { key: "aprobaciones", label: "Aprobaciones", href: "/logistica-inversa/aprobaciones" }
];

// Single white card shared by every reverse-logistics route — tabs + content.
// Page title, padding and background come from ViewWrapper's Header /
// .rightContent, so none are repeated here. Each tab lives at its own URL
// (/logistica-inversa/devoluciones, /logistica-inversa/aprobaciones,
// /logistica-inversa/aprobaciones/:id), so UiTab is driven as a router and the
// body is rendered below it rather than as tab children — that keeps the
// detail route's `children` override working.
export function ReverseLogisticsView({ activeTab, children }: ReverseLogisticsViewProps) {
  const router = useRouter();

  return (
    <div className="bg-cashport-white rounded-xl shadow-sm p-6">
      <UiTab
        tabs={TABS.map((tab) => ({ key: tab.key, label: tab.label, children: null }))}
        activeKey={activeTab}
        onChangeTab={(key) => {
          const tab = TABS.find((t) => t.key === key);
          if (tab) router.push(tab.href);
        }}
      />

      {children ?? (activeTab === "devoluciones" ? <DevolucionesTab /> : <AprobacionesTab />)}
    </div>
  );
}
