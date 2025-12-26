import React from 'react';
import { Sparkles } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from './Formatters';
import RiskBadge from './RiskBadge';
import ExpandableCard from './ExpandableCard';
import { CUSTOMERS_RISK, RISK_STATS, STRATEGIES_DATA } from '../lib/constants';

const DashboardManagement: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 animate-fade-in">
      
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
        
        {/* Risk Stats Cards */}
        <ExpandableCard 
            title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Riesgo por clientes</span>}
        >
            {(isExpanded) => (
                <div className="flex flex-col h-full justify-center">
                    <div className={`flex justify-between items-end ${isExpanded ? 'mb-12 px-12' : 'mb-6'}`}>
                        {[ 
                            { label: 'Clientes', count: 868, subtitle: 'Total' },
                            { label: 'Clientes', count: 2387, subtitle: 'Activos' },
                            { label: 'Clientes', count: 5208, subtitle: 'Inactivos' }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <p className={`${isExpanded ? 'text-3xl' : 'text-lg md:text-xl'} font-bold text-[#141414]`}>{item.count}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-1">{item.subtitle}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`flex rounded-lg overflow-hidden ${isExpanded ? 'h-20' : 'h-10 md:h-12'}`}>
                        {RISK_STATS.map((stat, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-center text-white text-[10px] md:text-xs font-bold transition-all"
                                style={{ width: `${stat.value}%`, backgroundColor: stat.color }}
                            >
                                {stat.percentage}
                            </div>
                        ))}
                    </div>
                    <div className={`flex justify-between mt-2 text-[10px] text-gray-500 px-1 overflow-x-auto gap-2 whitespace-nowrap ${isExpanded ? 'text-sm mt-4' : ''}`}>
                        {RISK_STATS.map((stat, idx) => (
                            <span key={idx} className="flex-shrink-0 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${isExpanded ? 'inline-block' : 'hidden'}`} style={{backgroundColor: stat.color}}></span>
                                {stat.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </ExpandableCard>

        {/* Strategies Table */}
        <ExpandableCard
             title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Estrategias de cobro</span>}
             noPadding={true}
        >
            {(isExpanded) => (
                <div className="overflow-x-auto">
                    <table className={`w-full text-xs ${isExpanded ? 'text-sm' : ''}`}>
                        <thead className="bg-[#141414] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left rounded-tl">Tipo de cliente</th>
                                <th className="px-4 py-3 text-right">Cartera</th>
                                <th className="px-4 py-3 text-center">%</th>
                                <th className="px-4 py-3 text-center rounded-tr">Visitas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {STRATEGIES_DATA.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{row.type}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(row.cartera)}</td>
                                    <td className="px-4 py-3 text-center">{row.percentage}%</td>
                                    <td className="px-4 py-3 text-center">{row.visits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ExpandableCard>

        {/* Novedades Summary */}
        <ExpandableCard
            title={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Novedades</span>}
        >
             {(isExpanded) => (
                <div className={`flex items-center justify-between h-full ${isExpanded ? 'px-8 py-8' : ''}`}>
                    <div>
                        <p className={`${isExpanded ? 'text-4xl' : 'text-xl md:text-2xl'} font-bold text-[#141414]`}>1290</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Total novedades</p>
                    </div>
                    <div className="text-right">
                        <p className={`${isExpanded ? 'text-4xl' : 'text-xl md:text-2xl'} font-bold text-[#141414]`}>1280</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Mes actual</p>
                    </div>
                    <div className={`${isExpanded ? 'h-24 w-32' : 'h-14 w-20 md:h-16 md:w-24'} bg-[#141414] rounded flex flex-col items-center justify-center text-white p-2`}>
                        <span className={`${isExpanded ? 'text-4xl' : 'text-xl md:text-2xl'} font-bold text-orange-500`}>16</span>
                        <span className="text-[10px] text-center leading-none mt-1">Dias prom.</span>
                    </div>
                </div>
             )}
         </ExpandableCard>
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-8">
        <ExpandableCard
            className="h-full"
            noPadding={true}
            title={
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center w-full pr-10">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Detallado por cliente</span>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold hover:bg-purple-200 transition-colors">
                        <Sparkles size={14} /> <span className="hidden sm:inline">Análisis con</span> CashportAI
                    </button>
                </div>
            }
        >
            {(isExpanded) => (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-x-auto">
                        <table className={`w-full text-xs ${isExpanded ? 'text-sm' : 'md:text-sm'} text-left whitespace-nowrap`}>
                            <thead className="bg-[#141414] text-white">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Cliente</th>
                                    <th className="px-4 py-3 font-semibold text-right">Cartera</th>
                                    <th className="px-4 py-3 font-semibold text-right">Vencido</th>
                                    <th className="px-4 py-3 font-semibold text-center">% Venc</th>
                                    <th className="px-4 py-3 font-semibold text-center">Visitas</th>
                                    <th className="px-4 py-3 font-semibold text-center w-28">Riesgo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {CUSTOMERS_RISK.map((customer, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white group-hover:bg-gray-50">{customer.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(customer.portfolio)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{formatCompactCurrency(customer.overdue)}</td>
                                        <td className="px-4 py-3 text-center">{customer.overduePercentage} %</td>
                                        <td className="px-4 py-3 text-center">{customer.visits}</td>
                                        <td className="px-4 py-3">
                                            <RiskBadge level={customer.risk} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-700 gap-2">
                        <span>Total</span>
                        <div className="flex gap-4 md:gap-8 flex-col sm:flex-row text-center sm:text-right">
                            <span>Cartera: $ 269.7B</span>
                            <span>Vencido: $ 95.6B</span>
                        </div>
                    </div>
                </div>
            )}
        </ExpandableCard>
      </div>

    </div>
  );
};

export default DashboardManagement;