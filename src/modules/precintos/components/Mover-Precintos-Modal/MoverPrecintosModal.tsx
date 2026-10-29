'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { cambiarEjecutivo, devolverStock } from '@/services/precintos/precintos';

interface MoverPrecintosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  precintosSeleccionados: string[];
  ejecutivosList: any[]; // 👈 Recibimos la lista con conteos
}

export const MoverPrecintosModal: React.FC<MoverPrecintosModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  precintosSeleccionados = [],
  ejecutivosList = [],
}) => {
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [guia, setGuia] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 👈 Estado para el menú

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
      setDestino('');
      setGuia('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

    const handleMover = async () => {
        try {
        setIsLoading(true);

        if (precintosSeleccionados.length === 0) throw new Error("No hay precintos seleccionados");
        if (!destino) throw new Error("Debes seleccionar un destino");

        console.log("👉 Iniciando movimiento de:", precintosSeleccionados.length, "precintos al ID:", destino);

        if (destino === 'bodega') {
            await devolverStock(precintosSeleccionados, fecha, guia);
            message.success(`¡${precintosSeleccionados.length} precintos devueltos a bodega!`);
        } else {
            await cambiarEjecutivo(precintosSeleccionados, destino, fecha, guia);
            message.success(`¡${precintosSeleccionados.length} precintos movidos con éxito!`);
        }
        
        // 👇 Esperamos un momento para que el mensaje se vea antes de cerrar
        setTimeout(() => {
            onSuccess();
        }, 500);

        } catch (error: any) {
        console.error("❌ ERROR EN MOVER:", error);
        message.error("Error: " + (error.response?.data?.message || error.message));
        } finally {
        setIsLoading(false);
        }
    };

  // Función para saber el nombre del destino seleccionado
  const getDestinoNombre = () => {
    if (!destino) return 'Selecciona un destino';
    if (destino === 'bodega') return 'Devolver a bodega';
    const exec = ejecutivosList.find(e => e.EjecutivoId === destino);
    return exec ? exec.EjecutivoNombre : 'Selecciona un destino';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f4fbc5] border border-[#c2f012]/50 flex items-center justify-center text-lime-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" /><path d="M4 20L21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Mover precintos</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Traslada precintos sin usar a otra persona o de vuelta a bodega</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Banner de precintos */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-[13px] font-semibold text-gray-800">
            <span className="font-extrabold text-gray-900">Precintos:</span> {precintosSeleccionados.slice(0, 3).join(', ')}
            {precintosSeleccionados.length > 3 && ` ... y ${precintosSeleccionados.length - 3} más`} · {precintosSeleccionados.length} precintos
          </div>

          {/* Selector de Destino Personalizado */}
          <div className="space-y-2 relative">
            <label className="block text-[13px] font-bold text-gray-900">Mover a</label>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer"
            >
              <span className={destino ? "text-gray-900 font-bold" : "text-gray-400"}>
                {getDestinoNombre()}
              </span>
              <span className="text-gray-400 text-[13px]">▼</span>
            </button>

            {/* Menú desplegable */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-20 top-[65px] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-2">
                  
                  {/* Opción Bodega */}
                  <button
                    type="button"
                    onClick={() => { setDestino('bodega'); setIsDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-gray-900">Devolver a bodega</div>
                    <div className="text-[13px] text-gray-500">1.129 disponibles</div>
                  </button>

                  {/* Lista de Ejecutivos */}
                  {ejecutivosList.map((exec) => (
                    <button
                      key={exec.EjecutivoId}
                      type="button"
                      onClick={() => { setDestino(exec.EjecutivoId); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="text-sm font-medium text-gray-800">{exec.EjecutivoNombre}</div>
                      <div className="text-[13px] text-gray-500">{exec.Asignados} asignados</div>
                    </button>
                  ))}

                </div>
              </>
            )}
          </div>

          {/* Fecha y Guía */}
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
        </div>

        {/* Footer */}
        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-[13px] text-gray-400 font-medium">{!destino ? 'Selecciona el destino' : 'Listo para mover'}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Cancelar</button>
            <button type="button" disabled={!destino || isLoading} onClick={handleMover} className={`px-6 py-2.5 text-[13px] font-bold rounded-xl transition-colors cursor-pointer ${destino && !isLoading ? 'bg-[#c2f012] text-black hover:bg-[#b0dc0e] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {isLoading ? 'Moviendo...' : `Mover ${precintosSeleccionados.length} precintos`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};