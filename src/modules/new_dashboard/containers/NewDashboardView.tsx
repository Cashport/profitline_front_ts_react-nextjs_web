"use client";

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Tab } from '../lib/types';
import SettingsModal from '../components/SettingsModal';
import Sidebar from '../components/Sidebar';
import DashboardCartera from '../components/DashboardCartera';
import DashboardManagement from '../components/DashboardManagement';
import DashboardMap from '../components/DashboardMap';
import DashboardOverview from '../components/DashboardOverview';


const NewDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.COLLECTION);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getHeaderContent = () => {
      switch(activeTab) {
          case Tab.COLLECTION:
              return { title: 'Resumen de Recaudo', subtitle: 'Metas y avance diario' };
          case Tab.PORTFOLIO:
              return { title: 'Estado de Cartera', subtitle: 'Análisis por vencimiento y zona' };
          case Tab.MANAGEMENT:
              return { title: 'Gestión de Cobranza', subtitle: 'Estrategias y riesgo' };
          case Tab.MAP:
              return { title: 'Mapa de Riesgo', subtitle: 'Geolocalización de clientes' };
          default:
              return { title: '', subtitle: '' };
      }
  }

  const { title, subtitle } = getHeaderContent();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#141414]">
      <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div className="flex flex-1 pt-0 relative">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenSettings={() => setIsModalOpen(true)}
        />
        
        {/* 
            Padding Logic:
            - Added pb-32 to bottom to prevent content hiding behind floating Sidebar.
        */}
        <main className="flex-1 w-full transition-all duration-300 overflow-x-hidden pb-32">
          <div className="max-w-[1800px] mx-auto">
             <div className="mb-6 flex flex-row justify-between items-center">
                <div>
                    <h2 className="text-xl md:text-3xl font-extrabold text-[#141414] tracking-tight leading-tight">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 font-medium">
                        {subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white hover:bg-gray-50 text-[#141414] border border-gray-200 p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                        aria-label="Filtros y configuración"
                    >
                        <SlidersHorizontal size={20} className="text-gray-600" />
                    </button>
                </div>
             </div>

            {activeTab === Tab.COLLECTION && <DashboardOverview />}
            {activeTab === Tab.PORTFOLIO && <DashboardCartera />}
            {activeTab === Tab.MANAGEMENT && <DashboardManagement />}
            {activeTab === Tab.MAP && <DashboardMap />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewDashboardView;