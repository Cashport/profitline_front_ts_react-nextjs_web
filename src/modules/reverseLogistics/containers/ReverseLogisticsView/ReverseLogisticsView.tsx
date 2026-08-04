"use client";

import { useState } from "react";
import { DevolucionesTab } from "../../components/DevolucionesTab/DevolucionesTab";
import { AprobacionesTab } from "../../components/AprobacionesTab/AprobacionesTab";

type TabKey = "devoluciones" | "aprobaciones";

export function ReverseLogisticsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("devoluciones");

  return (
    // Single white card — tabs + content. Page title, padding and background come
    // from ViewWrapper's Header / .rightContent, so none are repeated here.
    <div className="bg-cashport-white rounded-xl shadow-sm">
      <div className="flex border-b border-cashport-gray-light px-4">
        {(["devoluciones", "aprobaciones"] as const).map((tab) => {
          const label = tab === "devoluciones" ? "Devoluciones" : "Aprobaciones";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 mr-6 text-sm border-b-2 transition-colors ${
                isActive
                  ? "border-cashport-black text-cashport-black font-bold"
                  : "border-transparent text-gray-400 font-normal hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "devoluciones" && <DevolucionesTab />}
      {activeTab === "aprobaciones" && <AprobacionesTab />}
    </div>
  );
}
