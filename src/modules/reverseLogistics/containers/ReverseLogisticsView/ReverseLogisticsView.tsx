"use client";

import Link from "next/link";
import { ReactNode } from "react";
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
// .rightContent, so none are repeated here. Tabs are real Next.js links so
// each tab lives at its own URL (/logistica-inversa/devoluciones,
// /logistica-inversa/aprobaciones, /logistica-inversa/aprobaciones/:id)
// without any visual change for the user.
export function ReverseLogisticsView({ activeTab, children }: ReverseLogisticsViewProps) {
  return (
    <div className="bg-cashport-white rounded-xl shadow-sm">
      <div className="flex border-b border-cashport-gray-light px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`py-3 px-1 mr-6 text-sm border-b-2 transition-colors ${
                isActive
                  ? "border-cashport-black text-cashport-black font-bold"
                  : "border-transparent text-gray-400 font-normal hover:text-gray-600"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children ??
        (activeTab === "devoluciones" ? <DevolucionesTab /> : <AprobacionesTab />)}
    </div>
  );
}