'use client';

import React from 'react';

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
              
              {/* 👇 COLUMNAS CON FLECHITAS 👇 */}
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('EjecutivoNombre')}>
                <div className="flex items-center">Ejecutivo {renderSortIcon('EjecutivoNombre')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('UltimoEnvio')}>
                <div className="flex items-center">Último envío {renderSortIcon('UltimoEnvio')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('Recibidos')}>
                <div className="flex items-center">Recibidos {renderSortIcon('Recibidos')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('Usados')}>
                <div className="flex items-center">Usados {renderSortIcon('Usados')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('Anulados')}>
                <div className="flex items-center">Anulados {renderSortIcon('Anulados')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('PorcentajeUso')}>
                <div className="flex items-center">% de uso {renderSortIcon('PorcentajeUso')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort && onSort('Asignados')}>
                <div className="flex items-center">Asignados {renderSortIcon('Asignados')}</div>
              </th>
              
              <th className="py-3 px-4 font-bold text-right"></th>
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
                    <span className="font-bold text-gray-700 text-xs">
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