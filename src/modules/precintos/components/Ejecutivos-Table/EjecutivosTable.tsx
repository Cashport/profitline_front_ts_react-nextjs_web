'use client';

import React from 'react';
import SortArrows from "@/components/ui/sort-arrows/sort-arrows";

export interface IEjecutivoStats {
  EjecutivoId: string;
  EjecutivoNombre: string;
  UltimoEnvio: string;
  Recibidos: number;
  Usados: number;
  Anulados: number;
  PorcentajeUso: number;
  Asignados: number;
}

interface EjecutivosTableProps {
  data: IEjecutivoStats[];
  onVer?: (ejecutivo: IEjecutivoStats) => void;
  onMover?: (ejecutivo: IEjecutivoStats) => void;
  onSort?: (field: string) => void;     // 👈 Asegúrate de que esté aquí
  sortField?: string;                   // 👈 Asegúrate de que esté aquí
  sortOrder?: 'ASC' | 'DESC';           // 👈 Asegúrate de que esté aquí
}

export const EjecutivosTable: React.FC<EjecutivosTableProps> = ({ 
  data = [], 
  onVer, 
  onMover,
  onSort,
  sortField,
  sortOrder
}) => {
  
  // 👇 Función para pintar las flechitas
  const renderSortIcon = (field: string) => (
    <SortArrows dir={sortField === field ? (sortOrder === 'ASC' ? 'asc' : 'desc') : null} />
  );

  return (
    <div className="w-full bg-white overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="select-none">
              
              {/* 👇 COLUMNAS CON FLECHITAS 👇 */}
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('EjecutivoNombre')}>
                <span className="inline-flex items-center gap-1">Ejecutivo{renderSortIcon('EjecutivoNombre')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('UltimoEnvio')}>
                <span className="inline-flex items-center gap-1">Último envío{renderSortIcon('UltimoEnvio')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('Recibidos')}>
                <span className="inline-flex items-center gap-1">Recibidos{renderSortIcon('Recibidos')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('Usados')}>
                <span className="inline-flex items-center gap-1">Usados{renderSortIcon('Usados')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('Anulados')}>
                <span className="inline-flex items-center gap-1">Anulados{renderSortIcon('Anulados')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('PorcentajeUso')}>
                <span className="inline-flex items-center gap-1">% de uso{renderSortIcon('PorcentajeUso')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 cursor-pointer text-[13.5px] font-semibold text-cp-ink" onClick={() => onSort && onSort('Asignados')}>
                <span className="inline-flex items-center gap-1">Asignados{renderSortIcon('Asignados')}</span>
              </th>
              
              <th className="border-b border-cp-line bg-cp-surface py-3 px-4 text-right text-[13.5px] font-semibold text-cp-ink"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {data.map((ejecutivo) => (
              <tr key={ejecutivo.EjecutivoId} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 font-bold text-gray-900">
                  {ejecutivo.EjecutivoNombre}
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">
                  {ejecutivo.UltimoEnvio ? new Date(ejecutivo.UltimoEnvio).toLocaleDateString('es-CO') : '-'}
                </td>
                <td className="py-3 px-4 font-medium text-gray-800">{ejecutivo.Recibidos}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{ejecutivo.Usados}</td>
                <td className="py-3 px-4 font-medium text-pink-600">{ejecutivo.Anulados}</td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#c2f012]" 
                        style={{ width: `${Math.min(ejecutivo.PorcentajeUso, 100)}%` }} 
                      />
                    </div>
                    <span className="font-bold text-gray-700 text-[13px]">
                      {Math.round(ejecutivo.PorcentajeUso)}%
                    </span>
                  </div>
                </td>
                
                <td className="py-3 px-4 font-bold text-gray-900">
                  {ejecutivo.Asignados}
                </td>
                
                <td className="py-3 px-4 text-right space-x-3">
                  <button 
                    type="button"
                    onClick={() => onVer && onVer(ejecutivo)} 
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors"
                  >
                    Ver
                  </button>
                  <button 
                    type="button"
                    onClick={() => onMover && onMover(ejecutivo)} 
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors"
                  >
                    Mover
                  </button>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                  No hay ejecutivos con precintos asignados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};