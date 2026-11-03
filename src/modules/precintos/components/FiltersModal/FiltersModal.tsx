'use client';

import React, { useState } from 'react';
import { DateFilter } from './DateFilter';
import { ExecutiveFilter } from './ExecutiveFilter';
import { ClientFilter } from './ClientFilter';
import { ReasonFilter } from './ReasonFilter';

export interface IAppliedFilters {
  selectedPeriod: string | null;
  selectedExecs: string[];
  selectedClients: string[];
  selectedReasons: string[];
  fromDate?: string;
  toDate?: string;
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: IAppliedFilters) => void;
  initialFilters: IAppliedFilters;
}

type FilterTab = 'fecha' | 'ejecutivo' | 'cliente' | 'motivo';

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('fecha');

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(initialFilters.selectedPeriod);
  const [selectedExecs, setSelectedExecs] = useState<string[]>(initialFilters.selectedExecs);
  const [selectedClients, setSelectedClients] = useState<string[]>(initialFilters.selectedClients);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(initialFilters.selectedReasons);
  
  const [fromDate, setFromDate] = useState<string>(initialFilters.fromDate || '');
  const [toDate, setToDate] = useState<string>(initialFilters.toDate || '');

  if (!isOpen) return null;

  const getCount = (tabId: FilterTab): number => {
    switch (tabId) {
        case 'fecha': return (selectedPeriod ? 1 : 0) + (fromDate || toDate ? 1 : 0);
        case 'ejecutivo': return selectedExecs.length;
        case 'cliente': return selectedClients.length;
        case 'motivo': return selectedReasons.length;
        default: return 0;
    }
  }

  const handleClearAll = () => {
    setSelectedPeriod(null);
    setSelectedExecs([]);
    setSelectedClients([]);
    setSelectedReasons([]);
    setFromDate('');
    setToDate('');
  }

  const handleApply = () => {
    // 👇 Enviamos todo, incluyendo selectedReasons
    onApply({
        selectedPeriod,
        selectedExecs,
        selectedClients,
        selectedReasons,
        fromDate,
        toDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header del Modal */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#eefb98] flex items-center justify-center text-lime-800 font-bold text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filtros avanzados</h3>
              <p className="text-sm text-gray-400">Encuentra y selecciona múltiples opciones</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Menú Lateral */}
          <div className="w-1/4 min-w-[210px] bg-gray-50/60 border-r border-gray-100 p-4 space-y-2">
            {[
              { id: 'fecha', label: 'Fecha' },
              { id: 'ejecutivo', label: 'Ejecutivo' },
              { id: 'cliente', label: 'Cliente' },
              { id: 'motivo', label: 'Motivo' },
            ].map((tab) => {
              const count = getCount(tab.id as FilterTab);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#c2f012] text-black text-[13px] font-extrabold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                    <span className="text-[13px] text-gray-400">›</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contenido */}
          <div className="w-3/4 p-7 overflow-y-auto max-h-[600px]">
            {activeTab === 'fecha' && (
              <DateFilter
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
              />
            )}
            {activeTab === 'ejecutivo' && (
              <ExecutiveFilter selectedExecs={selectedExecs} setSelectedExecs={setSelectedExecs} />
            )}
            {activeTab === 'cliente' && (
              <ClientFilter selectedClients={selectedClients} setSelectedClients={setSelectedClients} />
            )}
            {activeTab === 'motivo' && (
              <ReasonFilter selectedReasons={selectedReasons} setSelectedReasons={setSelectedReasons} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-bold text-gray-700 hover:text-black transition-colors cursor-pointer"
          >
            Limpiar todo
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleApply} className="px-6 py-2.5 text-sm font-bold bg-[#c2f012] text-black rounded-xl hover:bg-[#b0dc0e] shadow-sm transition-colors cursor-pointer">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};