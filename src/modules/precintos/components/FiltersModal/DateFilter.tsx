'use client';

import React from 'react';

interface DateFilterProps {
  selectedPeriod: string | null;
  setSelectedPeriod: (period: string | null) => void;
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) => {
  const periods = [
    'Hoy',
    'Esta semana',
    'Mes actual',
    'Último mes',
    'Último trimestre',
    'YTD',
    'Últimos 12 meses',
  ];

  // 👇 FUNCIÓN MÁGICA: Calcula las fechas reales según el periodo 👇
  const handlePeriodSelect = (period: string) => {
    if (selectedPeriod === period) {
      // Si ya estaba seleccionado, lo quitamos
      setSelectedPeriod(null);
      setFromDate('');
      setToDate('');
      return;
    }

    setSelectedPeriod(period);
    
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (period) {
      case 'Hoy':
        // Hoy y Hoy
        break;
      case 'Esta semana':
        // Lunes a Domingo
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Lunes
        from = new Date(today.setDate(diff));
        to = new Date(today.setDate(diff + 6));
        break;
      case 'Mes actual':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'Último mes':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'Último trimestre':
        from = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'YTD':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date();
        break;
      case 'Últimos 12 meses':
        from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        to = new Date();
        break;
    }

    // Formateamos a YYYY-MM-DD
    const formatDate = (date: Date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    setFromDate(formatDate(from));
    setToDate(formatDate(to));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-100/80 py-3 px-4 rounded-xl text-center text-[13px] font-semibold text-gray-600">
        Selecciona un periodo (fabricación, asignación, uso o anulación)
      </div>

      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Periodos predefinidos</h4>
        <div className="grid grid-cols-2 gap-3">
          {periods.map((period) => {
            const isSelected = selectedPeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodSelect(period)}
                className={`py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'border border-[#c2f012] bg-[#f4fbc5] text-black font-bold shadow-sm'
                    : 'border border-gray-200 bg-gray-50/50 text-gray-700 font-medium hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-800">
          <span className="text-base">📅</span>
          <span>Rango personalizado</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] text-gray-500 font-medium mb-1.5">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setSelectedPeriod(null); 
              }}
              className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-[13px] text-gray-500 font-medium mb-1.5">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setSelectedPeriod(null);
              }}
              className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};