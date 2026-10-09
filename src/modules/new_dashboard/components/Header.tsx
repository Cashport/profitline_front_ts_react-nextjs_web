import React, { useState } from 'react';
import { RefreshCcw, SlidersHorizontal, X, Check, Building2, Globe } from 'lucide-react';
import { COLORS } from '../lib/constants';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState('COP');

  return (
    <>
      {/* Minimal Header Bar */}
      <header className="px-4 py-3 md:px-6 md:py-3 flex items-center justify-between shadow-sm relative z-20" style={{ backgroundColor: COLORS.black }}>
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shrink-0">
            <RefreshCcw size={16} className="text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Cartera</h1>
        </div>

        {/* Filter / Settings Trigger */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#333] hover:bg-[#444] text-white px-3 py-2 rounded-lg transition-all border border-gray-700"
        >
            <span className="text-xs font-semibold text-gray-300 hidden md:block">Filtros y moneda</span>
            <SlidersHorizontal size={18} className="text-[#CBE71E]" />
        </button>
      </header>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in scale-100 transform transition-all">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">Configuración de vista</h3>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    
                    {/* Currency Section */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wide">Moneda</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                            <button 
                                onClick={() => setCurrency('COP')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    currency === 'COP' 
                                    ? 'bg-white text-[#141414] shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {currency === 'COP' && <Check size={14} className="text-[#CBE71E]" />}
                                COP
                            </button>
                            <button 
                                onClick={() => setCurrency('USD')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    currency === 'USD' 
                                    ? 'bg-white text-[#141414] shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {currency === 'USD' && <Check size={14} className="text-[#CBE71E]" />}
                                USD
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-4 block uppercase tracking-wide">Filtros globales</label>
                        <div className="space-y-4">
                            
                            {/* Filter: City */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Globe size={16} className="text-gray-400" />
                                    Ciudad
                                </label>
                                <select className="w-full bg-gray-50 text-gray-800 text-sm py-3 px-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#CBE71E] border border-gray-200 transition-shadow">
                                    <option>Todas las ciudades</option>
                                    <option>Bogotá</option>
                                    <option>Medellín</option>
                                    <option>Cali</option>
                                </select>
                            </div>

                            {/* Filter: Type */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Building2 size={16} className="text-gray-400" />
                                    Tipo de negocio
                                </label>
                                <select className="w-full bg-gray-50 text-gray-800 text-sm py-3 px-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#CBE71E] border border-gray-200 transition-shadow">
                                    <option>Todos los tipos</option>
                                    <option>Comercial</option>
                                    <option>Logística</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Company Context */}
                     <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-100">
                             <span className="text-sm font-medium text-red-800">Organización</span>
                             <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200 shadow-sm">COCA-COLA FEMSA</span>
                        </div>
                     </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="py-3 px-4 rounded-xl text-sm font-bold text-[#141414] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{ backgroundColor: COLORS.green }}
                    >
                        Aplicar cambios
                    </button>
                </div>

            </div>
        </div>
      )}
    </>
  );
};

export default Header;