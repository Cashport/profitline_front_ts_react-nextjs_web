'use client';

import React, { useEffect, useState } from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { formatFechaPrecinto } from '../../utils/fechas';

interface UsadosTableProps {
  data?: any[];
  onDevolucionClick?: (id: string) => void;
  onSelectionChange?: (seleccionados: string[]) => void;
  /** Reutilizar los precintos de la fila (devolver a bodega o asignar a un ejecutivo). */
  onReutilizar?: (codigos: string[]) => void;
  onSort?: (field: string) => void; // 👈 NUEVO
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const UsadosTable: React.FC<UsadosTableProps> = ({ 
  data = [], 
  onDevolucionClick,
  onSelectionChange,
  onReutilizar,
  onSort,
  sortField,
  sortOrder
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const codigosDe = (item: any): string[] => (item.PrecintosArray ? item.PrecintosArray.split(',') : [item.IdPrecinto]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(data.filter((item) => selectedIds.includes(item.Id)).flatMap(codigosDe));
    }
  }, [selectedIds, data, onSelectionChange]);

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
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 w-12 text-right text-[13.5px] font-semibold text-cp-ink"></th>
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
                  
                  <td className="py-3 px-4">
                    <button type="button" onClick={() => onDevolucionClick && onDevolucionClick(item.IdDevolucion)} className="text-cp-blue hover:text-cp-blue-hover font-semibold cursor-pointer" title={item.IdDevolucion}>
                      {item.IdDevolucion ? `${item.IdDevolucion.substring(0, 15)}...` : 'Sin devolución'}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink text-[13px]">{item.ClienteNombre || 'Cliente no disponible'}</td>
                  <td className="py-3 px-4 font-medium text-cp-ink-2">
                    {formatFechaPrecinto(item.FechaUso || item.FechaRegistro)}
                  </td>
                  <td className="py-3 px-4 font-medium text-cp-ink">{item.UsuarioAsignoNombre || 'Sin nombre'}</td>
                  <td className="py-3 px-4 text-right relative">
                    {onReutilizar && (
                      <>
                        <button type="button" onClick={() => setActiveMenuId(activeMenuId === item.Id ? null : item.Id)} className="p-1 rounded-lg hover:bg-cp-bg text-cp-ink-4 hover:text-cp-ink transition-colors cursor-pointer">•••</button>
                        {activeMenuId === item.Id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-4 top-8 z-20 w-56 bg-cp-surface rounded-xl shadow-[0_12px_32px_rgba(0,0,0,.14)] py-2 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onReutilizar(codigosDe(item));
                                }}
                                className="w-full px-4 py-2 text-[13px] font-semibold text-cp-ink hover:bg-cp-bg text-left transition-colors cursor-pointer"
                              >
                                Reutilizar {item.Cantidad > 1 ? `(${item.Cantidad})` : ''}
                              </button>
                            </div>
                          </>
                        )}
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