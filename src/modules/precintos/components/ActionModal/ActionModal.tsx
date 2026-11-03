'use client';

import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
  selectedCount?: number;
  totalCount?: number;
  onMover?: () => void;
  onDevolver?: () => void;
  onAnular?: () => void; // 👈 NUEVA PROP
  onDownloadInventory?: () => void;
  onDownloadFiltered?: () => void;
  onDownloadSelected?: () => void; 
}

interface ActionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon, iconBg, title, subtitle, disabled = false, onClick,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 select-none ${
        disabled
          ? 'border-gray-100 bg-gray-50/40 opacity-40 cursor-not-allowed'
          : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${iconBg}`}>
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <h4 className={`text-[13px] font-bold truncate ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-[13px] leading-tight ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      </div>
    </button>
  );
};

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  selectedCount = 0,
  totalCount = 0,
  onMover,
  onDevolver,
  onAnular, // 👈 Recibimos la prop
  onDownloadInventory,
  onDownloadFiltered,
  onDownloadSelected,
}) => {
  if (!isOpen) return null;

  const handleActionClick = (actionId: string) => {
    if (onSelectAction) onSelectAction(actionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-5 pb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Generar acción</h3>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {selectedCount > 0 ? `${selectedCount} precintos seleccionados` : 'Selecciona la acción que vas a realizar'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-5 pt-1 space-y-5 overflow-y-auto">
          {/* ASIGNACIÓN */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-800">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Asignación</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard icon="+" iconBg="bg-blue-50 text-blue-600" title="Ingresar a bodega" subtitle="Crear precintos nuevos" onClick={() => handleActionClick('ingresar')} />
              <ActionCard icon="+" iconBg="bg-blue-50 text-blue-600" title="Asignar a ejecutivo" subtitle="Por rango o códigos" onClick={() => handleActionClick('asignar')} />
              <ActionCard icon="↔" iconBg="bg-blue-50/60 text-blue-400" title="Cambiar de ejecutivo" subtitle={`${selectedCount} asignados`} disabled={selectedCount === 0} onClick={() => onMover && onMover()} />
              <ActionCard icon="↓" iconBg="bg-blue-50/60 text-blue-400" title="Devolver a bodega" subtitle={`${selectedCount} asignados`} disabled={selectedCount === 0} onClick={() => onDevolver && onDevolver()} />
            </div>
          </div>

          {/* BAJA */}
          <div className="space-y-2.5 pt-1.5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-800">
              <span className="w-2 h-2 rounded-full bg-pink-600"></span>
              <span>Baja</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ActionCard 
                icon="✕" 
                iconBg="bg-pink-50 text-pink-600" 
                title="Anular precintos" 
                subtitle={`${selectedCount} sin usar`} 
                disabled={selectedCount === 0} 
                onClick={() => onAnular && onAnular()} // 👈 Conectado aquí
              />
            </div>
          </div>

          {/* DESCARGAS */}
          <div className="space-y-2.5 pt-1.5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-800">
              <span className="w-2 h-2 rounded-full bg-[#9ec400]"></span>
              <span>Descargas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ActionCard 
                icon="↓" 
                iconBg="bg-lime-50 text-lime-700" 
                title="Descargar selección" 
                subtitle={selectedCount > 0 ? `${selectedCount} precintos` : 'Sin selección'}
                disabled={selectedCount === 0} 
                onClick={() => onDownloadSelected && onDownloadSelected()} 
              />
              <ActionCard 
                icon="↓" 
                iconBg="bg-lime-50 text-lime-700" 
                title="Descargar filtrados" 
                subtitle={`${totalCount} precintos · CSV`} 
                onClick={() => onDownloadFiltered && onDownloadFiltered()} 
              />
              <ActionCard 
                icon="↓" 
                iconBg="bg-lime-50 text-lime-700" 
                title="Inventario completo" 
                subtitle="Todos los precintos · CSV" 
                onClick={() => onDownloadInventory && onDownloadInventory()} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};