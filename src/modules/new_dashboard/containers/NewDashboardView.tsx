"use client";

import React, { useState } from "react";
import Header from "@/components/organisms/header";
import { FilterButton } from "@/components/ui/page-header-controls/page-header-controls";
import { Tab } from "../lib/types";
import SettingsModal from "../components/SettingsModal";
import Sidebar from "../components/Sidebar";
import DashboardCartera from "../components/DashboardCartera";
import DashboardManagement from "../components/DashboardManagement";
import DashboardMap from "../components/DashboardMap";
import DashboardOverview from "../components/DashboardOverview";

const NewDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.COLLECTION);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getHeaderContent = () => {
    switch (activeTab) {
      case Tab.COLLECTION:
        return { title: "Resumen de Recaudo", subtitle: "Metas y avance diario" };
      case Tab.PORTFOLIO:
        return { title: "Estado de Cartera", subtitle: "Análisis por vencimiento y zona" };
      case Tab.MANAGEMENT:
        return { title: "Gestión de Cobranza", subtitle: "Estrategias y riesgo" };
      case Tab.MAP:
        return { title: "Mapa de Riesgo", subtitle: "Geolocalización de clientes" };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const { title, subtitle } = getHeaderContent();

  return (
    <div className="cp-page min-h-full font-sans text-[#141414]">
      {/* Header compartido (docs/DESIGN.md §4): título de la pestaña y "Filtrar" abre filtros y configuración */}
      <Header
        title={title}
        titleExtra={subtitle}
        actionsExtra={<FilterButton onClick={() => setIsModalOpen(true)} />}
      />
      <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsModalOpen(true)}
      />

      {/* pb-32: el contenido no queda oculto tras la barra flotante de pestañas */}
      <main className="w-full overflow-x-hidden pb-32">
        {activeTab === Tab.COLLECTION && <DashboardOverview />}
        {activeTab === Tab.PORTFOLIO && <DashboardCartera />}
        {activeTab === Tab.MANAGEMENT && <DashboardManagement />}
        {activeTab === Tab.MAP && <DashboardMap />}
      </main>
    </div>
  );
};

export default NewDashboardView;
