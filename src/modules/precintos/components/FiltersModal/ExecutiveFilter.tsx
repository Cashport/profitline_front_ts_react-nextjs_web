'use client';

import React, { useState, useEffect } from 'react';
import { getFilterExecutives } from '@/services/precintos/precintos'; // 👈 Importamos la función

interface ExecutiveFilterProps {
  selectedExecs: string[];
  setSelectedExecs: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ExecutiveFilter: React.FC<ExecutiveFilterProps> = ({
  selectedExecs,
  setSelectedExecs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ejecutivos, setEjecutivos] = useState<{ Id: string; UserName: string }[]>([]); // 👈 Estado para los ejecutivos

  // 👇 Traemos los ejecutivos reales al cargar el componente
  useEffect(() => {
    const fetchEjecutivos = async () => {
      try {
        const data = await getFilterExecutives();
        setEjecutivos(data.data || data); // Depende de cómo envuelva la respuesta la API
      } catch (error) {
        console.error("Error cargando ejecutivos", error);
      }
    };
    fetchEjecutivos();
  }, []);

  const filteredExecs = ejecutivos.filter((exec) =>
    exec.UserName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (name: string) => {
    setSelectedExecs((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    if (selectedExecs.length === filteredExecs.length) {
      setSelectedExecs([]);
    } else {
      setSelectedExecs(filteredExecs.map((e) => e.UserName));
    }
  };

  const isAllSelected =
    filteredExecs.length > 0 && selectedExecs.length === filteredExecs.length;

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
          placeholder="Buscar en ejecutivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="bg-gray-100/70 py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
        <span>{filteredExecs.length} RESULTADOS</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[#9ec400] hover:text-lime-700 font-bold transition-colors cursor-pointer capitalize text-xs"
        >
          {isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-y-4 gap-x-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredExecs.map((exec) => {
          const isChecked = selectedExecs.includes(exec.UserName);

          return (
            <label
              key={exec.Id}
              onClick={() => toggleSelect(exec.UserName)}
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
              <span
                className="text-sm text-gray-700 font-medium truncate"
                title={exec.UserName}
              >
                {exec.UserName}
              </span>
            </label>
          );
        })}

        {filteredExecs.length === 0 && (
          <div className="col-span-3 text-center py-6 text-sm text-gray-400 italic">
            No se encontraron ejecutivos con ese nombre.
          </div>
        )}
      </div>
    </div>
  );
};