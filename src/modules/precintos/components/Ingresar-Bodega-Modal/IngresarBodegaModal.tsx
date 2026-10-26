'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { createPrecintos } from '@/services/precintos/precintos';

interface IngresarBodegaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IngresarBodegaModal: React.FC<IngresarBodegaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'rango' | 'individual'>('rango');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [codigosIndividuales, setCodigosIndividuales] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
      setDesde('');
      setHasta('');
      setCodigosIndividuales('');
      setObservacion('');
      setErrorModal(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIngresar = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);
      
      let listaCodigos: string[] = [];

      if (activeTab === 'rango') {
        // 👇 REGEX MEJORADA: Acepta letras, números y guiones al inicio. 
        // El grupo 1 es el prefijo, el grupo 2 son los dígitos finales.
        const matchDesde = desde.trim().match(/^([a-zA-Z0-9-]*?)(\d+)$/);
        const matchHasta = hasta.trim().match(/^([a-zA-Z0-9-]*?)(\d+)$/);

        if (!matchDesde || !matchHasta) {
          throw new Error("Por favor ingresa un formato válido. El código debe terminar en números (Ej. TS100, 100, A-50).");
        }

        const prefijoDesde = matchDesde[1];
        const numDesde = parseInt(matchDesde[2], 10);
        const prefijoHasta = matchHasta[1];
        const numHasta = parseInt(matchHasta[2], 10);

        if (prefijoDesde !== prefijoHasta) {
          throw new Error("El prefijo (letras o guiones) debe ser igual en el 'Desde' y el 'Hasta'.");
        }

        if (numHasta < numDesde) {
          throw new Error("El número final debe ser mayor o igual al inicial.");
        }

        for (let i = numDesde; i <= numHasta; i++) {
          listaCodigos.push(`${prefijoDesde}${i}`);
        }

      } else {
        listaCodigos = codigosIndividuales.split(/[\n,]+/).map(c => c.trim()).filter(c => c !== '');
      }

      if (listaCodigos.length === 0) throw new Error("No hay códigos para ingresar");

      const response = await createPrecintos(listaCodigos, fecha, observacion);
      
      if (response) {
        const insertados = response.insertados || [];
        const repetidos = response.repetidos || [];
        const backendMessage = response.message || '';

        if (insertados.length === 0 && repetidos.length > 0) {
          setErrorModal(backendMessage);
          message.warning(backendMessage, 5);
          return; 
        }

        if (insertados.length > 0 && repetidos.length > 0) {
          message.warning(backendMessage, 6);
        } else if (insertados.length > 0) {
          message.success(backendMessage || `¡${insertados.length} precintos ingresados con éxito!`);
        }
      }
      
      onSuccess();
      
    } catch (error: any) {
      if (error.message && !error.response) {
        setErrorModal(error.message);
      } else {
        message.error("Error: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                <line x1="12" y1="8" x2="12" y2="10"></line>
                <line x1="10" y1="10" x2="14" y2="10"></line>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Ingresar a bodega</h3>
              <p className="text-xs text-gray-400 mt-0.5">Registra precintos nuevos que llegan al inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 space-y-6">
          {/* 1. Precintos nuevos */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">1. Precintos nuevos</label>
            
            <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl gap-1">
              <button type="button" onClick={() => setActiveTab('rango')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'rango' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Rango</button>
              <button type="button" onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'individual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Individual / códigos</button>
            </div>

            {activeTab === 'rango' ? (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Desde</label>
                  <input type="text" placeholder="Ej. TS100" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Hasta</label>
                  <input type="text" placeholder="Ej. TS109" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Códigos (separados por coma o salto de línea)</label>
                <textarea rows={3} placeholder="Ej: TS100, TS102, 12003..." value={codigosIndividuales} onChange={(e) => setCodigosIndividuales(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-black resize-none" />
              </div>
            )}
          </div>

          {/* 2. Envío */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">2. Envío</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Proveedor / observación <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" placeholder="Ej. Factura 4581 · Precintos Andinos" value={observacion} onChange={(e) => setObservacion(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
            </div>
          </div>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs text-gray-400 font-medium">
            {isLoading ? 'Guardando en la base de datos...' : 'Ingresa un rango o los códigos'}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={handleIngresar} disabled={isLoading} className="px-6 py-2.5 text-xs font-bold bg-[#c2f012] text-black rounded-xl hover:bg-[#b0dc0e] shadow-sm transition-colors cursor-pointer disabled:opacity-50">
              {isLoading ? 'Ingresando...' : 'Ingresar precintos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};