"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import Header from "@/components/organisms/header";
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
  /** Título del header compartido; por defecto el del listado. */
  title?: string;
  /** Pantallas de detalle: muestra "‹" en el header (ruta padre si se entró por URL). */
  back?: boolean | string;
}

const TABS: { key: ReverseLogisticsTabKey; label: string; href: string }[] = [
  { key: "devoluciones", label: "Devoluciones", href: "/logistica-inversa/devoluciones" },
  { key: "aprobaciones", label: "Aprobaciones", href: "/logistica-inversa/aprobaciones" }
];

// Single white card shared by every reverse-logistics route — tabs + content.
// The shared Header is rendered here (the route layout hides ViewWrapper's) so
// the detail route can show "‹" (docs/DESIGN.md §4); padding and background
// come from ViewWrapper's .rightContent. Each tab lives at its own URL
// (/logistica-inversa/devoluciones, /logistica-inversa/aprobaciones,
// /logistica-inversa/aprobaciones/:id), so UiTab is driven as a router and the
// body is rendered below it rather than as tab children — that keeps the
// detail route's `children` override working.
export function ReverseLogisticsView({
  activeTab,
  children,
  title = "Listado de devoluciones",
  back
}: ReverseLogisticsViewProps) {
  const router = useRouter();

  return (
    <div className="cp-page">
      <Header title={title} back={back} />
      <div className="cp-card px-[18px] py-[14px]">
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
    </div>
  );
}
