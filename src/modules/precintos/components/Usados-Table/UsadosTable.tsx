'use client';

import React, { useState } from 'react';

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

  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return <span className="text-[10px] text-gray-900 font-bold ml-1">{sortOrder === 'ASC' ? '▲' : '▼'}</span>;
    }
    return <span className="text-[10px] text-gray-400 ml-1">▲▼</span>;
  };

  return (
    <div className="w-full bg-white overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-800 font-bold select-none">
              <th className="py-3 px-4 w-10"><input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 accent-[#c2f012] w-4 h-4 cursor-pointer" /></th>
              
              {/* 👇 COLUMNA ORDENABLE: PRECINTO 👇 */}
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('IdPrecinto')}>
                <div className="flex items-center">Precinto {renderSortIcon('IdPrecinto')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold">Hasta</th>
              <th className="py-3 px-4 font-bold">Cantidad</th>
              <th className="py-3 px-4 font-bold">ID Devolución</th>
              <th className="py-3 px-4 font-bold">Cliente</th>
              
              {/* 👇 COLUMNA ORDENABLE: FECHA DE USO 👇 */}
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('FechaRegistro')}>
                <div className="flex items-center">Fecha de uso {renderSortIcon('FechaRegistro')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold">Usado por</th>
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
                      {item.IdDevolucion ? `${item.IdDevolucion.substring(0, 15)}...` : 'Sin Devolución'}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 uppercase text-[11px] tracking-wide">{item.ClienteNombre || 'Cliente no disponible'}</td>
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