'use client';

import React, { useState, useEffect } from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";

interface AsignadosTableProps {
  data?: any[]; 
  onSelectionChange?: (seleccionados: string[]) => void;
  onMoverEjecutivo?: (codigos: string[], ejecutivoActualId: string | null) => void; 
  onDevolverBodega?: (codigos: string[]) => void;
  onAnularPrecintos?: (codigos: string[]) => void; 
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const AsignadosTable: React.FC<AsignadosTableProps> = ({
  data = [],
  onSelectionChange,
  onMoverEjecutivo,
  onDevolverBodega,
  onAnularPrecintos,
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

  const renderSortIcon = (field: string) => (
    <SortArrows dir={sortField === field ? (sortOrder === 'ASC' ? 'asc' : 'desc') : null} />
  );

  return (
    <div className="w-full bg-white overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="select-none">
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-10 text-[13.5px] font-semibold text-cp-ink">
                <input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" />
              </th>
              
              {/* 👇 COLUMNA ORDENABLE: DESDE 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('IdPrecinto')}>
                <span className="inline-flex items-center gap-1">Desde{renderSortIcon('IdPrecinto')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Hasta</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Cantidad</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Ejecutivo</th>
              
              {/* 👇 COLUMNA ORDENABLE: ASIGNADO (Fecha) 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('FechaRegistro')}>
                <span className="inline-flex items-center gap-1">Asignado{renderSortIcon('FechaRegistro')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Asignado por</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-12 text-right text-[13.5px] font-semibold text-cp-ink"></th>
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
                  <td className="py-3 px-4 font-medium text-gray-800">{item.UsuarioAsignoNombre || 'Sin asignar'}</td>
                  <td className="py-3 px-4 font-medium text-gray-600">{item.FechaAsigno ? new Date(item.FechaAsigno).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="py-3 px-4 font-medium text-gray-600">{item.UsuarioAsignacionNombre || 'Sistema'}</td>
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
                              if (onMoverEjecutivo) onMoverEjecutivo(getCodigosDelItem(), item.UsuarioAsigno); 
                            }} 
                            className="w-full px-4 py-2 text-[13px] font-semibold text-gray-800 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                          >
                            Cambiar de ejecutivo {item.Cantidad > 1 ? `(${item.Cantidad})` : ''}
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => { 
                              setActiveMenuId(null); 
                              if (onDevolverBodega) onDevolverBodega(getCodigosDelItem()); 
                            }} 
                            className="w-full px-4 py-2 text-[13px] font-semibold text-gray-800 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                          >
                            Devolver a bodega {item.Cantidad > 1 ? `(${item.Cantidad})` : ''}
                          </button>

                          <button 
                            type="button" 
                            onClick={() => { 
                              setActiveMenuId(null); 
                              if (onAnularPrecintos) onAnularPrecintos(getCodigosDelItem()); 
                            }} 
                            className="w-full px-4 py-2 text-[13px] font-semibold text-pink-600 hover:bg-pink-50/50 text-left transition-colors cursor-pointer"
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