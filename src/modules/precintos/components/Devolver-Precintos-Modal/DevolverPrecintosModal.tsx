'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { devolverStock } from '@/services/precintos/precintos';

interface DevolverPrecintosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  precintosSeleccionados: string[];
}

export const DevolverPrecintosModal: React.FC<DevolverPrecintosModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  precintosSeleccionados = [],
}) => {
  const [fecha, setFecha] = useState('');
  const [guia, setGuia] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
      setGuia('');
      setErrorModal(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDevolver = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);
      
      if (precintosSeleccionados.length === 0) throw new Error("No hay precintos seleccionados");

      const response = await devolverStock(precintosSeleccionados, fecha, guia);
      
      // 👇 Validamos omitidos
      if (response && response.data && response.data.omitidos && response.data.omitidos.length > 0) {
        message.warning(response.message, 6);
        setErrorModal(response.message);
        if (response.data.count > 0) onSuccess();
        return;
      }

      message.success(`¡${precintosSeleccionados.length} precintos devueltos a bodega con éxito!`);
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
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" /><path d="M4 20L21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Devolver a bodega</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Registra el retorno de precintos al inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-[13px] font-semibold text-gray-800">
            <span className="font-extrabold text-gray-900">Precintos:</span> 
            {precintosSeleccionados.slice(0, 4).join(', ')}
            {precintosSeleccionados.length > 4 && ` ... y ${precintosSeleccionados.length - 4} más`} 
            {' '}· {precintosSeleccionados.length} precintos
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-[13px] font-bold text-gray-900">Detalle del traslado</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Guía / observación <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" placeholder="Ej. Servientrega..." value={guia} onChange={(e) => setGuia(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black" />
              </div>
            </div>
          </div>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[13px] font-medium p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-[13px] text-gray-400 font-medium">Listo para devolver</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
            <button type="button" disabled={isLoading} onClick={handleDevolver} className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${!isLoading ? 'bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {isLoading ? 'Devolviendo...' : `Devolver ${precintosSeleccionados.length} precintos`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};