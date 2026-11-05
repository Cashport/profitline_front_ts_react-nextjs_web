'use client';

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getAssignableExecutives, reutilizarPrecintos } from '@/services/precintos/precintos';
import { hoyLocal } from '../../utils/fechas';

interface ReutilizarPrecintosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  precintosSeleccionados: string[];
}

interface Ejecutivo {
  Id: string;
  UserName: string;
  Nombre?: string;
}

/** Reutiliza precintos usados hace más de año y medio: vuelven a bodega o se asignan a un ejecutivo. */
export const ReutilizarPrecintosModal: React.FC<ReutilizarPrecintosModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  precintosSeleccionados = [],
}) => {
  const [destino, setDestino] = useState<'bodega' | 'ejecutivo'>('bodega');
  const [ejecutivo, setEjecutivo] = useState('');
  const [fecha, setFecha] = useState('');
  const [ejecutivosList, setEjecutivosList] = useState<Ejecutivo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDestino('bodega');
    setEjecutivo('');
    setFecha(hoyLocal());
    setErrorModal(null);
    getAssignableExecutives()
      .then(setEjecutivosList)
      .catch((error) => console.error('Error cargando ejecutivos', error));
  }, [isOpen]);

  if (!isOpen) return null;

  const listo = precintosSeleccionados.length > 0 && (destino === 'bodega' || Boolean(ejecutivo));

  const handleReutilizar = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);
      const response = await reutilizarPrecintos(
        precintosSeleccionados,
        destino,
        destino === 'ejecutivo' ? ejecutivo : undefined,
        destino === 'ejecutivo' ? fecha : undefined
      );

      if (response?.data?.omitidos?.length > 0) {
        message.warning(response.message, 8);
        setErrorModal(response.message);
        if (response.data.count > 0) onSuccess();
        return;
      }

      message.success(
        destino === 'bodega'
          ? `¡${precintosSeleccionados.length} precintos devueltos a bodega para reutilizar!`
          : `¡${precintosSeleccionados.length} precintos asignados para reutilizar!`
      );
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrorModal(errorMsg);
      message.error('Error: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const opcion = (valor: 'bodega' | 'ejecutivo', titulo: string, detalle: string) => (
    <button
      type="button"
      onClick={() => setDestino(valor)}
      className={`flex-1 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
        destino === valor ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-[13px] font-bold text-gray-900">{titulo}</div>
      <div className="text-[13px] text-gray-400 mt-0.5">{detalle}</div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Reutilizar precintos</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Solo los usados hace más de un año y medio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-[13px] font-semibold text-gray-800">
            <span className="font-extrabold text-gray-900">Precintos:</span>{' '}
            {precintosSeleccionados.slice(0, 4).join(', ')}
            {precintosSeleccionados.length > 4 && ` ... y ${precintosSeleccionados.length - 4} más`}
            {' '}· {precintosSeleccionados.length} precintos
          </div>

          <div className="space-y-2.5">
            <label className="block text-[13px] font-bold text-gray-900">¿A dónde van?</label>
            <div className="flex gap-3">
              {opcion('bodega', 'Devolver a bodega', 'Quedan disponibles para asignar')}
              {opcion('ejecutivo', 'Asignar a un ejecutivo', 'Se entregan directo')}
            </div>
          </div>

          {destino === 'ejecutivo' && (
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <div className="relative pt-3">
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Ejecutivo que recibe</label>
                <select value={ejecutivo} onChange={(e) => setEjecutivo(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer">
                  <option value="" disabled>Selecciona un ejecutivo</option>
                  {ejecutivosList.map((exec) => (
                    <option key={exec.Id} value={exec.Id}>{exec.Nombre || exec.UserName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Fecha de entrega</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer" />
              </div>
            </div>
          )}

          <p className="text-[13px] text-gray-400">
            El uso anterior queda en el historial (devolución y cliente). Los que tengan menos de año y medio se omiten y te avisamos.
          </p>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[13px] font-medium p-3 rounded-xl flex items-start gap-2">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
          <button type="button" disabled={!listo || isLoading} onClick={handleReutilizar} className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${listo && !isLoading ? 'bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {isLoading ? 'Reutilizando...' : `Reutilizar ${precintosSeleccionados.length} precintos`}
          </button>
        </div>
      </div>
    </div>
  );
};
