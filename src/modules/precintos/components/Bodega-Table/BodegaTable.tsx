'use client';

import React, { useState, useEffect } from 'react';

interface BodegaTableProps {
  data?: any[];
  onSelectionChange?: (seleccionados: string[]) => void;
  onAsignarEjecutivo?: (codigos: string[]) => void; 
  onAnularPrecinto?: (codigos: string[]) => void;
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const BodegaTable: React.FC<BodegaTableProps> = ({
  data = [],
  onSelectionChange,
  onAsignarEjecutivo,
  onAnularPrecinto,
  onSort,
  sortField,
  sortOrder,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (onSelectionChange) {
      const codigos = data
        .filter(item => selectedIds.includes(item.Id))
        .flatMap(item => 
          item.PrecintosArray 
            ? item.PrecintosArray.split(',') 
            : [item.IdPrecinto]
        );
      onSelectionChange(codigos);
    }
  }, [selectedIds, data, onSelectionChange]);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([]);
    else setSelectedIds(data.map(item => item.Id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper para pintar las flechitas
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return <span className="text-[10px] text-gray-900 font-bold ml-1">{sortOrder === 'ASC' ? '▲' : '▼'}</span>;
    }
    return <span className="text-[10px] text-gray-400 ml-1">▲▼</span>;
  };

  return (
    <div className="w-full mt-2 bg-white rounded-2xl border border-gray-100 overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-800 font-bold select-none">
              <th className="py-3 px-4 w-10">
                <input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" />
              </th>
              
              {/* 👇 COLUMNA ORDENABLE: DESDE 👇 */}
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('IdPrecinto')}>
                <div className="flex items-center">Desde {renderSortIcon('IdPrecinto')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold">Hasta</th>
              <th className="py-3 px-4 font-bold">Cantidad</th>
              
              {/* 👇 COLUMNA ORDENABLE: FABRICADO 👇 */}
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('FechaRegistro')}>
                <div className="flex items-center">Fabricado {renderSortIcon('FechaRegistro')}</div>
              </th>
              
              <th className="py-3 px-4 w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {data.map((item: any) => {
              const isSelected = selectedIds.includes(item.Id);
              const isMenuOpen = activeMenuId === item.Id;

              const getCodigosDelItem = () => {
                return item.PrecintosArray ? item.PrecintosArray.split(',') : [item.IdPrecinto];
              };

              return (
                <tr key={item.Id} className={`hover:bg-gray-50/70 transition-colors ${isSelected ? 'bg-gray-50/40' : ''}`}>
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelectRow(item.Id)} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.IdPrecinto}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.IdPrecintoHasta || ''}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.Cantidad || 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-600">{item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="py-3 px-4 text-right relative">
                    <button type="button" onClick={() => setActiveMenuId(isMenuOpen ? null : item.Id)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">•••</button>
                    
                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-4 top-8 z-20 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-left animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            type="button" 
                            onClick={() => { 
                              setActiveMenuId(null); 
                              if (onAsignarEjecutivo) onAsignarEjecutivo(getCodigosDelItem()); 
                            }} 
                            className="w-full px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                          >
                            Asignar a ejecutivo {item.Cantidad > 1 ? `(${item.Cantidad})` : ''}
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => { 
                              setActiveMenuId(null); 
                              if (onAnularPrecinto) onAnularPrecinto(getCodigosDelItem()); 
                            }} 
                            className="w-full px-4 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50/50 text-left transition-colors cursor-pointer"
                          >
                            Anular precinto {item.Cantidad > 1 ? `(${item.Cantidad})` : ''}
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};