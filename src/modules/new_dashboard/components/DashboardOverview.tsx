import React from 'react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, CartesianGrid
} from 'recharts';
import { Clock, FileQuestion, Timer } from 'lucide-react';
import { formatCompactCurrency, formatCurrency } from './Formatters';
import ExpandableCard from './ExpandableCard';
import { COLLECTION_TREND } from '../lib/constants';

const DashboardOverview: React.FC = () => {
  
  // Real Data Simulation
  const goalAmount = 150000000000; // 150 Mil Millones
  const actualAmount = goalAmount * 0.36; // 36% currently
  const forecastAmount = goalAmount * 1.10; // 110% projected

  const percentActual = (actualAmount / goalAmount) * 100; 
  const percentForecast = (forecastAmount / goalAmount) * 100; 

  // Visualization Math
  // We want the "Goal" (100%) to be at approx 75% of the total bar width to leave room for overachievement.
  // So the total visual scale goes from 0% to ~135% of the goal.
  const MAX_VISUAL_PERCENT = 135; 
  
  const getWidth = (pct: number) => `${Math.min((pct / MAX_VISUAL_PERCENT) * 100, 100)}%`;
  
  // Logic for the split bar
  // Base Bar (Black): Represents Actual Progress (e.g., 36%)
  const baseFillPercent = Math.min(percentActual, 100);
  
  // Helper for simplified currency display (e.g. "$ 54")
  const formatSimple = (val: number) => `$ ${Math.round(val / 1000000000)}`;

  const MetricMarker = ({ left, topLabel, bottomLabel, colorClass = "text-gray-400", borderColorClass = "border-gray-300" }: { left: string, topLabel: string, bottomLabel: string, colorClass?: string, borderColorClass?: string }) => (
    <div 
        className="absolute top-0 bottom-0 flex flex-col justify-between items-center z-20"
        style={{ left, transform: 'translateX(-50%)' }}
    >
        {/* Top Label */}
        <span className={`text-[10px] font-bold mb-2 ${colorClass}`}>
            {topLabel}
        </span>
        
        {/* Dashed Line */}
        <div className={`flex-1 w-px border-l-2 border-dashed ${borderColorClass} h-full`}></div>
        
        {/* Bottom Label (Money) - Simple format as requested */}
        <span className="text-[10px] md:text-xs font-bold text-gray-500 mt-2 whitespace-nowrap bg-[#F7F7F7] md:bg-white px-1 rounded">
            {bottomLabel}
        </span>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 animate-fade-in">
        
        {/* Recaudo Block */}
        <div className="col-span-12 lg:col-span-5">
            <ExpandableCard 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> 
                            Recaudo
                        </span>
                        <span className="bg-gray-100 text-[#141414] font-bold px-3 py-1 rounded-full text-xs md:text-sm mr-2 md:mr-0">
                            {percentActual.toFixed(1)}%
                        </span>
                    </div>
                }
                className="h-full"
            >
                {(isExpanded) => (
                    <div className="flex flex-col h-full justify-between relative pt-6 px-2">
                        
                        {/* Metrics Headers */}
                        <div className="flex justify-between items-end mb-2 px-1">
                            <div>
                                <h4 className="text-xs text-gray-400 font-bold mb-1">Meta del mes</h4>
                                <p className="text-3xl md:text-4xl font-bold text-[#141414]">{formatCompactCurrency(goalAmount)}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-xs text-gray-400 font-bold mb-1">Recaudo actual</h4>
                                <p className="text-3xl md:text-4xl font-bold text-[#141414]">{formatCompactCurrency(actualAmount)}</p>
                            </div>
                        </div>

                        {/* Visual Progress Track Container */}
                        <div className="relative h-32 w-full mt-2 mb-2">
                            
                            {/* 1. Metric Markers (Lines & Labels) */}
                            
                            {/* Recaudo Marker */}
                            <MetricMarker 
                                left={getWidth(baseFillPercent)} 
                                topLabel="Recaudo" 
                                bottomLabel={formatSimple(actualAmount)}
                                colorClass="text-[#141414]"
                                borderColorClass="border-[#141414]"
                            />

                            {/* Goal Marker - Neutral Gray */}
                            <MetricMarker 
                                left={getWidth(100)} 
                                topLabel="Meta" 
                                bottomLabel={formatSimple(goalAmount)} 
                            />

                            {/* Forecast Marker - Neutral Gray */}
                            <MetricMarker 
                                left={getWidth(percentForecast)} 
                                topLabel="Fcst" 
                                bottomLabel={formatSimple(forecastAmount)} 
                            />

                            {/* 2. The Bar Track (Vertically Centered) */}
                            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
                                {/* Rounded-sm for square look */}
                                <div className="relative h-10 w-full bg-gray-100 rounded-sm overflow-hidden">
                                    {/* Base Progress (Actual) - Black */}
                                    <div 
                                        className="h-full bg-[#141414] rounded-sm transition-all duration-1000 ease-out relative z-10"
                                        style={{ width: getWidth(baseFillPercent) }}
                                    ></div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Stats */}
                        <div className={`bg-gray-50 rounded-lg p-3 text-center border border-gray-100 mt-auto ${isExpanded ? 'max-w-xl mx-auto w-full mb-4' : ''}`}>
                            <span className="text-gray-500 text-xs">Cumplimiento actual: </span>
                            <span className="font-bold text-[#141414] text-sm ml-1">{percentActual.toFixed(1)}%</span>
                            <span className="text-gray-300 mx-3">|</span>
                            <span className="text-gray-500 text-xs">Forecast cierre: </span>
                            <span className="font-bold text-[#141414] text-sm ml-1">{percentForecast.toFixed(1)}%</span>
                        </div>

                    </div>
                )}
            </ExpandableCard>
        </div>

        {/* Chart Block */}
        <div className="col-span-12 lg:col-span-7">
            <ExpandableCard 
                title={
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> 
                        Avance diario de recaudo
                    </div>
                }
                className="h-full"
            >
                {(isExpanded) => (
                    <div className="flex flex-col h-full">
                         <div className={`w-full ${isExpanded ? 'h-[500px] flex-1' : 'h-[250px] md:h-[300px]'}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={COLLECTION_TREND} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={formatCompactCurrency} />
                                    <Tooltip 
                                        formatter={(value: number) => formatCompactCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                    />
                                    {/* Cumulative Goal Line: Solid Dark Line */}
                                    <Line type="linear" dataKey="goal" stroke="#141414" strokeWidth={2} dot={false} name="Meta" />
                                    
                                    {/* Actual Recaudo: Orange, ConnectNulls=false (breaks on null) */}
                                    <Line type="monotone" dataKey="actual" stroke="#ea580c" strokeWidth={isExpanded ? 3 : 2.5} dot={{r: 3, fill: '#ea580c'}} activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}} name="Recaudo" connectNulls={false} />
                                    
                                    {/* Forecast: Green, ConnectNulls=false (shows only from current day) */}
                                    <Line type="monotone" dataKey="forecast" stroke="#22C55E" strokeWidth={isExpanded ? 3 : 2} dot={false} name="Forecast" connectNulls={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 mt-4 pb-2">
                            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                <span className="w-3 h-3 rounded-full bg-[#141414]"></span> Meta
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                <span className="w-3 h-3 rounded-full bg-orange-600"></span> Recaudo
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span> Forecast
                            </div>
                        </div>
                    </div>
                )}
            </ExpandableCard>
        </div>

        {/* Operational Metrics Row */}
        <div className="col-span-12 md:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        Pagos por aplicar
                    </span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Clock size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-[#141414]">{formatCompactCurrency(3200000000)}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">142 pagos pendientes</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-span-12 md:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col justify-between hover:shadow-md transition-shadow group">
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        Pagos no identificados
                    </span>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                        <FileQuestion size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-[#141414]">{formatCompactCurrency(150000000)}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">5 pagos sin referencia</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-span-12 md:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col justify-between hover:shadow-md transition-shadow group">
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        Días prom. aplicación
                    </span>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                        <Timer size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-[#141414]">1.2 Días</p>
                    <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded">-0.3 vs mes anterior</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};

export default DashboardOverview;