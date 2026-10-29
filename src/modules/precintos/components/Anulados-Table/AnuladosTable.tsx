'use client';

import React, { useState } from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";

interface AnuladosTableProps {
  data?: any[];
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const AnuladosTable: React.FC<AnuladosTableProps> = ({ 
  data = [],
  onSort,
  sortField,
  sortOrder
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([]);
    else setSelectedIds(data.map(item => item.Id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
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
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-10 text-[13.5px] font-semibold text-cp-ink"><input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" /></th>
              
              {/* 👇 COLUMNA ORDENABLE: PRECINTO 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('IdPrecinto')}>
                <span className="inline-flex items-center gap-1">Desde{renderSortIcon('IdPrecinto')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Hasta</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Cantidad</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Motivo</th>
              
              {/* 👇 COLUMNA ORDENABLE: FECHA DE ANULACIÓN 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('FechaRegistro')}>
                <span className="inline-flex items-center gap-1">Fecha de anulación{renderSortIcon('FechaRegistro')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Anulado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {data.map((item) => {
              const isSelected = selectedIds.includes(item.Id);
              return (
                <tr key={item.Id} className={`hover:bg-gray-50/70 transition-colors ${isSelected ? 'bg-gray-50/40' : ''}`}>
                  <td className="py-3 px-4"><input type="checkbox" checked={isSelected} onChange={() => toggleSelectRow(item.Id)} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" /></td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.IdPrecinto}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.IdPrecintoHasta || ''}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.Cantidad || 1}</td>
                  
                  <td className="py-3 px-4 font-medium text-gray-800">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e6007e]"></span>
                      {item.MotivoAnulacion || 'No especificado'}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 font-medium text-gray-600">
                    {item.FechaAnulacion 
                      ? new Date(item.FechaAnulacion).toLocaleDateString('es-CO') 
                      : (item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString('es-CO') : '-')}
                  </td>
                  
                  <td className="py-3 px-4 font-medium text-gray-800">{item.UsuarioModifico || item.UsuarioRegistro || 'Sistema'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};