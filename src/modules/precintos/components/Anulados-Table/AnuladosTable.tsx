'use client';

import React, { useState } from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { formatFechaPrecinto } from '../../utils/fechas';

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
    <div className="w-full min-w-0">
      <div className="min-w-0">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="select-none">
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-10 text-[13.5px] font-semibold text-cp-ink"><input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-cp-line-2 accent-[#cbe71e] w-4 h-4 cursor-pointer" /></th>
              
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
          <tbody className="divide-y divide-cp-muted text-cp-ink">
            {data.map((item) => {
              const isSelected = selectedIds.includes(item.Id);
              return (
                <tr key={item.Id} className={`hover:bg-cp-subtle transition-colors ${isSelected ? 'bg-cp-subtle' : ''}`}>
                  <td className="py-3 px-4"><input type="checkbox" checked={isSelected} onChange={() => toggleSelectRow(item.Id)} className="rounded border-cp-line-2 accent-[#cbe71e] w-4 h-4 cursor-pointer" /></td>
                  <td className="py-3 px-4 font-semibold text-cp-ink">{item.IdPrecinto}</td>
                  <td className="py-3 px-4 font-semibold text-cp-ink">{item.IdPrecintoHasta || ''}</td>
                  <td className="py-3 px-4 font-medium text-cp-ink">{item.Cantidad || 1}</td>
                  
                  <td className="py-3 px-4 font-medium text-cp-ink">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cp-magenta"></span>
                      {item.MotivoAnulacion || 'No especificado'}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 font-medium text-cp-ink-2">
                    {formatFechaPrecinto(item.FechaAnulacion || item.FechaRegistro)}
                  </td>
                  
                  <td className="py-3 px-4 font-medium text-cp-ink">{item.UsuarioModifico || item.UsuarioRegistro || 'Sistema'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};