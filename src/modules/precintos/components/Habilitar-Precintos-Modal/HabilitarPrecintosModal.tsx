'use client';

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getPrecintosInhabilitados, habilitarPrecintos } from '@/services/precintos/precintos';
import { armarRango, partirCodigosEscritos } from '../../utils/rangos';

interface HabilitarPrecintosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Habilita precintos inhabilitados (inactivos) del proyecto: pasan a bodega. */
export const HabilitarPrecintosModal: React.FC<HabilitarPrecintosModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'rango' | 'individual'>('rango');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [codigos, setCodigos] = useState('');
  const [inhabilitados, setInhabilitados] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('rango');
    setDesde('');
    setHasta('');
    setCodigos('');
    setErrorModal(null);
    setInhabilitados(null);
    getPrecintosInhabilitados()
      .then(setInhabilitados)
      .catch(() => setInhabilitados(null));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHabilitar = async () => {
    try {
      setIsLoading(true);
      setErrorModal(null);

      const lista = activeTab === 'rango' ? armarRango(desde, hasta) : partirCodigosEscritos(codigos);
      if (lista.length === 0) throw new Error('No hay códigos para habilitar');
      if (lista.length > 1000) throw new Error('Máximo 1.000 precintos por operación');

      const response = await habilitarPrecintos(lista);
      if (response?.data?.omitidos?.length > 0) {
        message.warning(response.message, 6);
        setErrorModal(response.message);
        if (response.data.count > 0) onSuccess();
        return;
      }

      message.success(`¡${lista.length} precintos habilitados! Ya están en bodega.`);
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrorModal(errorMsg);
      message.error('Error: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const listo = activeTab === 'rango' ? Boolean(desde.trim() && hasta.trim()) : Boolean(codigos.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Habilitar precintos</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {inhabilitados === null
                  ? 'Los precintos inhabilitados vuelven a bodega'
                  : `${inhabilitados.toLocaleString('es-CO')} precintos inhabilitados en este proyecto`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="inline-flex p-1 bg-gray-100/80 rounded-2xl gap-1">
            <button type="button" onClick={() => setActiveTab('rango')} className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${activeTab === 'rango' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Rango</button>
            <button type="button" onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${activeTab === 'individual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>Individual / códigos</button>
          </div>

          {activeTab === 'rango' ? (
            <>
              <p className="text-[13px] text-gray-400">Ej. 100 – 109 o TS100 – TS109 (mismo prefijo)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Desde</label>
                  <input type="text" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Hasta</label>
                  <input type="text" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Códigos (separados por coma o salto de línea)</label>
              <textarea rows={4} placeholder="Ej: 2081, 2082, CLIS_3676..." value={codigos} onChange={(e) => setCodigos(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-black resize-none" />
            </div>
          )}

          <p className="text-[13px] text-gray-400">Solo cambian los que están inhabilitados; los demás se omiten y te avisamos.</p>

          {errorModal && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[13px] font-medium p-3 rounded-xl flex items-start gap-2">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>{errorModal}</div>
            </div>
          )}
        </div>

        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
          <button type="button" disabled={!listo || isLoading} onClick={handleHabilitar} className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${listo && !isLoading ? 'bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {isLoading ? 'Habilitando...' : 'Habilitar precintos'}
          </button>
        </div>
      </div>
    </div>
  );
};
