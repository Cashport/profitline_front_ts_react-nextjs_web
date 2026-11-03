'use client';

import React, { useState } from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";

interface UsadosTableProps {
  data?: any[];
  onDevolucionClick?: (id: string) => void;
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const UsadosTable: React.FC<UsadosTableProps> = ({ 
  data = [], 
  onDevolucionClick,
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
                <span className="inline-flex items-center gap-1">Precinto{renderSortIcon('IdPrecinto')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Hasta</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Cantidad</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">ID devolución</th>
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Cliente</th>
              
              {/* 👇 COLUMNA ORDENABLE: FECHA DE USO 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('FechaRegistro')}>
                <span className="inline-flex items-center gap-1">Fecha de uso{renderSortIcon('FechaRegistro')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-[13.5px] font-semibold text-cp-ink">Usado por</th>
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
                  
                  <td className="py-3 px-4">
                    <button type="button" onClick={() => onDevolucionClick && onDevolucionClick(item.IdDevolucion)} className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer" title={item.IdDevolucion}>
                      {item.IdDevolucion ? `${item.IdDevolucion.substring(0, 15)}...` : 'Sin devolución'}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 text-[13px]">{item.ClienteNombre || 'Cliente no disponible'}</td>
                  <td className="py-3 px-4 font-medium text-gray-600">
                    {item.FechaUso ? new Date(item.FechaUso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : (item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString('es-CO') : '-')}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.UsuarioAsignoNombre || 'Sin nombre'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};