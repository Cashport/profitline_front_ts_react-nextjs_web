'use client';

import React, { useState } from 'react';

const MOTIVOS_ANULACION = [
  'Precinto roto en instalación',
  'Extraviado en ruta',
  'Defecto de fábrica',
  'Mal diligenciado',
  'Otro'
];

interface ReasonFilterProps {
  selectedReasons: string[];
  setSelectedReasons: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ReasonFilter: React.FC<ReasonFilterProps> = ({ 
  selectedReasons, 
  setSelectedReasons 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReasons = MOTIVOS_ANULACION.filter((reason) =>
    reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (name: string) => {
    setSelectedReasons((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    if (selectedReasons.length === filteredReasons.length) {
      setSelectedReasons([]);
    } else {
      setSelectedReasons(filteredReasons);
    }
  };

  const isAllSelected = filteredReasons.length > 0 && selectedReasons.length === filteredReasons.length;

  return (
    <div className="space-y-5">
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar en motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="bg-gray-100/70 py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
        <span>{filteredReasons.length} RESULTADOS</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[#9ec400] hover:text-lime-700 font-bold transition-colors cursor-pointer capitalize text-xs"
        >
          {isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-4 max-h-[380px] overflow-y-auto pr-1">
        {filteredReasons.map((name) => {
          const isChecked = selectedReasons.includes(name);
          return (
            <label
              key={name}
              onClick={() => toggleSelect(name)}
              className="flex items-center gap-2.5 cursor-pointer group select-none py-0.5"
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                  isChecked
                    ? 'border-[#c2f012] bg-[#c2f012] text-black'
                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}
              >
                {isChecked && <span className="text-[10px] font-black">✓</span>}
              </div>
              <span className="text-sm text-gray-700 font-medium leading-snug">
                {name}
              </span>
            </label>
          );
        })}

        {filteredReasons.length === 0 && (
          <div className="col-span-2 text-center py-6 text-sm text-gray-400 italic">
            No se encontraron motivos con esa búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};