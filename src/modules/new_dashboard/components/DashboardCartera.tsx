import React from 'react';
import { formatCompactCurrency } from './Formatters';
import ExpandableCard from './ExpandableCard';
import { CITY_METRICS, PORTFOLIO_AGES } from '../lib/constants';

const DashboardCartera: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      
      {/* Top Section: Metrics/Ages and Division split */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        {/* Left: Estado de Cartera (Metrics + Ages) */}
        <div className="col-span-12 lg:col-span-6">
             <ExpandableCard 
                title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Estado de cartera</span>}
                className="h-full"
            >
                {(isExpanded) => (
                    <div className="flex flex-col justify-between h-full">
                        {/* Metrics Row */}
                        <div className={`flex flex-row justify-between items-baseline mb-8 ${isExpanded ? 'px-8 mt-4' : ''}`}>
                            <div className="text-left">
                                <p className={`${isExpanded ? 'text-5xl' : 'text-3xl md:text-4xl'} font-bold text-[#141414]`}>249.7MM</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Total cartera</p>
                            </div>
                            <div className="text-center">
                                <p className={`${isExpanded ? 'text-5xl' : 'text-3xl md:text-4xl'} font-bold text-[#141414]`}>20 %</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Vencido</p>
                            </div>
                            <div className="text-right">
                                <p className={`${isExpanded ? 'text-5xl' : 'text-3xl md:text-4xl'} font-bold text-orange-500`}>56</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">DSO</p>
                            </div>
                        </div>

                        {/* Ages Chart */}
                        <div>
                            <p className="text-xs text-gray-500 mb-3 font-semibold">Edades de cartera</p>
                            <div className={`${isExpanded ? 'h-32' : 'h-16 md:h-20'} w-full flex rounded-xl overflow-hidden shadow-sm`}>
                                {PORTFOLIO_AGES.map((age, idx) => (
                                    <div 
                                        key={idx} 
                                        style={{ width: `${age.value}%`, backgroundColor: age.color }}
                                        className="h-full relative group"
                                    >
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all cursor-pointer" title={`${age.name}: ${age.value}%`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3 justify-start mt-4">
                                {PORTFOLIO_AGES.map((age, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: age.color }}></span>
                                        <span className="text-xs text-gray-600 font-medium whitespace-nowrap">{age.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
             </ExpandableCard>
        </div>

        {/* Right: División de Cartera (Treemap) */}
        <div className="col-span-12 lg:col-span-6">
             <ExpandableCard 
                title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> División de cartera</span>}
                className="h-full"
            >
                {(isExpanded) => (
                    <div className="flex flex-col h-full">
                        <div className={`w-full ${isExpanded ? 'h-[400px]' : 'min-h-[200px] flex-1'} grid grid-cols-4 grid-rows-4 gap-1 bg-white rounded-xl overflow-hidden text-white text-[10px]`}>
                            <div className="col-span-3 row-span-4 bg-[#0F172A] p-3 relative hover:bg-[#1E293B] transition-colors rounded-lg flex flex-col justify-between shadow-sm">
                                <span className={`font-semibold ${isExpanded ? 'text-xl' : 'text-sm'}`}>Formal</span>
                                <div className="text-right">
                                    <span className="block text-xs text-gray-400">Total</span>
                                    <span className="font-bold text-sm md:text-base">98.2M</span>
                                </div>
                            </div>
                            <div className="col-span-1 row-span-2 bg-[#1E293B] p-1 flex items-center justify-center hover:bg-[#334155] text-[9px] text-center leading-tight rounded-lg">
                                Medellín
                            </div>
                            <div className="col-span-1 row-span-1 bg-[#334155] p-1 flex items-center justify-center hover:bg-[#475569] text-[9px] rounded-lg">
                                Cali
                            </div>
                            <div className="col-span-1 row-span-1 grid grid-cols-2 grid-rows-2 gap-1">
                                <div className="bg-[#475569] rounded-sm"></div>
                                <div className="bg-[#64748B] rounded-sm"></div>
                                <div className="bg-[#475569] rounded-sm"></div>
                                <div className="bg-[#64748B] rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                )}
             </ExpandableCard>
        </div>
      </div>

      {/* Table Section */}
      <div className="col-span-12">
        <ExpandableCard 
            title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Cartera por ciudad</span>}
            className="w-full"
            noPadding={true}
        >
            {(isExpanded) => (
                <div className="overflow-x-auto">
                    <table className={`w-full text-xs ${isExpanded ? 'text-sm' : 'md:text-sm'} text-left whitespace-nowrap`}>
                        <thead className="bg-[#141414] text-white">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Ciudad</th>
                                <th className="px-4 py-3 font-semibold text-right">Cartera</th>
                                <th className="px-4 py-3 font-semibold text-center">% Cartera</th>
                                <th className="px-4 py-3 font-semibold text-right">Corriente</th>
                                <th className="px-4 py-3 font-semibold text-right">0 a 30</th>
                                <th className="px-4 py-3 font-semibold text-right">30 a 60</th>
                                <th className="px-4 py-3 font-semibold text-right">60 a 90</th>
                                <th className="px-4 py-3 font-semibold text-right">90 a 180</th>
                                <th className="px-4 py-3 font-semibold text-right">{'>'} 180</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {CITY_METRICS.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white group-hover:bg-gray-50">{row.city}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.total)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-bold ${row.percentage > 50 ? 'bg-orange-100 text-orange-700' : 'text-gray-600'}`}>
                                            {row.percentage}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.current)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.d0_30)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.d30_60)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.d60_90)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.d90_180)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.gt180)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ExpandableCard>
      </div>
    </div>
  );
};

export default DashboardCartera;