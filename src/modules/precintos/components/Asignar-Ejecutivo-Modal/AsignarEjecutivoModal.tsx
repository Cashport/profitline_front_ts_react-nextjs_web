'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { asignarPrecintos, getFilterExecutives } from '@/services/precintos/precintos'; 

interface AsignarEjecutivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codigosIniciales?: string[];
}

interface Ejecutivo {
  Id: string;
  UserName: string;
}

export const AsignarEjecutivoModal: React.FC<AsignarEjecutivoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  codigosIniciales = [],
}) => {
  const [activeTab, setActiveTab] = useState<'rango' | 'individual'>('rango');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [codigosIndividuales, setCodigosIndividuales] = useState('');
  const [ejecutivo, setEjecutivo] = useState('');
  const [fecha, setFecha] = useState('');
  const [guia, setGuia] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ejecutivosList, setEjecutivosList] = useState<Ejecutivo[]>([]);
  
  // 👇 Estado para mostrar advertencias del backend dentro del modal
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
      setDesde('');
      setHasta('');
      setEjecutivo('');
      setGuia('');
      setErrorModal(null); // Limpiamos alertas al abrir

      if (codigosIniciales.length > 0) {
        setActiveTab('individual');
        setCodigosIndividuales(codigosIniciales.join(', '));
      } else {
        setActiveTab('rango');
        setCodigosIndividuales('');
      }

      const fetchEjecutivos = async () => {
        try {
          const data = await getFilterExecutives();
          setEjecutivosList(data.data || data); 
        } catch (error) {
          console.error("Error cargando ejecutivos", error);
        }
      };
      fetchEjecutivos();
    }
  }, [isOpen, codigosIniciales]);

  if (!isOpen) return null;

    const handleAsignar = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);

      let listaCodigos: string[] = [];

      if (activeTab === 'rango') {
        const inicio = parseInt(desde);
        const fin = parseInt(hasta);
        if (isNaN(inicio) || isNaN(fin)) throw new Error("Ingresa un rango válido");
        if (fin < inicio) throw new Error("El número final debe ser mayor o igual al inicial");

        // 👈 LÍMITE DE 1.000
        const cantidad = fin - inicio + 1;
        if (cantidad > 1000) {
          throw new Error(`El rango supera el máximo permitido de 1.000 precintos (solicitaste ${cantidad}).`);
        }

        for (let i = inicio; i <= fin; i++) {
          listaCodigos.push(i.toString());
        }
      } else {
        listaCodigos = codigosIndividuales.split(/[\n,]+/).map(c => c.trim()).filter(c => c !== '');
      }

      if (listaCodigos.length === 0) throw new Error("No hay códigos para asignar");
      if (!ejecutivo) throw new Error("Debes seleccionar un ejecutivo");

      const response = await asignarPrecintos(listaCodigos, ejecutivo, fecha, guia);
      
      if (response && response.data && response.data.omitidos && response.data.omitidos.length > 0) {
        message.warning(response.message, 6);
        setErrorModal(response.message);
        if (response.data.count > 0) {
           onSuccess();
        }
        return;
      }

      message.success(`¡${listaCodigos.length} precintos asignados con éxito!`);
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrorModal(errorMsg);
      message.error("Error: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Asignar precintos</h3>
              <p className="text-xs text-gray-400 mt-0.5">Registra el envío físico de precintos a un ejecutivo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">1. Precintos</label>

            <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl gap-1">
              <button type="button" onClick={() => setActiveTab('rango')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'rango' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Rango</button>
              <button type="button" onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'individual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Individual / códigos</button>
            </div>

            <p className="text-[11px] text-gray-400">Solo números · los precintos con código (ej. CLIS_3676) se asignan en &quot;Individual / códigos&quot;</p>

            {activeTab === 'rango' ? (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Desde</label>
                  <input type="text" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Hasta</label>
                  <input type="text" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Códigos (separados por coma o salto de línea)</label>
                <textarea rows={3} placeholder="Ej: CLIS_3676, CLIS_3677..." value={codigosIndividuales} onChange={(e) => setCodigosIndividuales(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-black resize-none" />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">2. Ejecutivo que recibe</label>
            <div className="relative">
              <select value={ejecutivo} onChange={(e) => setEjecutivo(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer">
                <option value="" disabled>Selecciona un ejecutivo</option>
                {ejecutivosList.map((exec) => (
                  <option key={exec.Id} value={exec.Id}>{exec.UserName}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-xs">▼</span>
            </div>
          </div>

          <div className="space-y-3 pt-1 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">3. Envío</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Guía de envío / observación <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" placeholder="Ej. Servientrega 2049381120" value={guia} onChange={(e) => setGuia(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
            </div>
          </div>

          {/* 👇 ALERTA VISUAL DE OMITIDOS 👇 */}
          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}

        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs text-gray-400 font-medium">{!ejecutivo ? 'Selecciona el ejecutivo' : 'Listo para asignar'}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
            <button type="button" disabled={!ejecutivo || isLoading} onClick={handleAsignar} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${ejecutivo && !isLoading ? 'bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {isLoading ? 'Asignando...' : 'Asignar precintos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};