'use client';

import React, { useState, useEffect } from 'react';
import { IPrecintoEstadoSummary } from '../../types/precintos_types';
import { FiltersModal, IAppliedFilters } from '../../components/FiltersModal/FiltersModal';
import { ActionModal } from '../../components/ActionModal/ActionModal';
import { CambiarPrecintoModal } from '../../components/Cambiar-Precinto-Modal/CambiarPrecintoModal';
import { DevolverPrecintosModal } from '../../components/Devolver-Precintos-Modal/DevolverPrecintosModal';
import { AsignarEjecutivoModal } from '../../components/Asignar-Ejecutivo-Modal/AsignarEjecutivoModal';
import { IngresarBodegaModal } from '../../components/Ingresar-Bodega-Modal/IngresarBodegaModal';
import { MoverPrecintosModal } from '../../components/Mover-Precintos-Modal/MoverPrecintosModal';
import { AnularPrecintosModal } from '../../components/Anular-Precintos-Modal/AnularPrecintosModal'; 
import { BodegaTable } from '../../components/Bodega-Table/BodegaTable';
import { AsignadosTable } from '../../components/Asignados-Table/AsignadosTable';
import { UsadosTable } from '../../components/Usados-Table/UsadosTable';
import { AnuladosTable } from '../../components/Anulados-Table/AnuladosTable';
import { EjecutivosTable } from '../../components/Ejecutivos-Table/EjecutivosTable';
import { getPrecintos, IPrecinto, descargarInventarioCSV, getEjecutivosStats, descargarFiltradosCSV, descargarSeleccionCSV } from '@/services/precintos/precintos';
import { message } from 'antd';

// Iconos SVG
const FilterIcon: React.FC = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"> <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /> </svg> );
const SearchIcon: React.FC = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"> <circle cx="11" cy="11" r="8" /> <line x1="21" y1="21" x2="16.65" y2="16.65" /> </svg> );
const PrecintoIcon: React.FC = () => ( <svg width="14" height="20" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-current"> <rect x="5" y="3" width="14" height="15" rx="3" /> <circle cx="12" cy="8.5" r="2" /> <path d="M12 18v8" /> <path d="M8 22h8" /> </svg> );

const Pagination = ({ currentPage, total, limit, onPageChange }: { currentPage: number, total: number, limit: number, onPageChange: (p: number) => void }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-gray-100 rounded-b-2xl">
      <span className="text-sm text-gray-500">{Math.min((currentPage - 1) * limit + 1, total)}–{Math.min(currentPage * limit, total)} de {total} precintos</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50 cursor-pointer">&lt;</button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-black text-white text-sm font-bold">{currentPage}</button>
        {totalPages > 1 && <span className="px-1 text-gray-400">...</span>}
        {totalPages > 2 && <span className="px-1 text-gray-500 text-sm">{totalPages}</span>}
        <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer">&gt;</button>
      </div>
    </div>
  );
};

export const PrecintosView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'precintos' | 'ejecutivos'>('precintos');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<number>(1); 

  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [expandedState, setExpandedState] = useState<string | null>('BODEGA');
  const [precintos, setPrecintos] = useState<IPrecinto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const [codigosParaAsignar, setCodigosParaAsignar] = useState<string[]>([]);
  const [ejecutivosData, setEjecutivosData] = useState<any[]>([]);
  const [isLoadingEjecutivos, setIsLoadingEjecutivos] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [isIngresarOpen, setIsIngresarOpen] = useState(false);
  const [isCambiarOpen, setIsCambiarOpen] = useState(false);
  const [isDevolverOpen, setIsDevolverOpen] = useState(false);
  const [precintosParaAccion, setPrecintosParaAccion] = useState<string[]>([]);
  
  const [isAnularOpen, setIsAnularOpen] = useState(false);
  const [precintosParaAnular, setPrecintosParaAnular] = useState<string[]>([]);

  const [isMoverOpen, setIsMoverOpen] = useState(false);
  const [precintosParaMover, setPrecintosParaMover] = useState<string[]>([]);
  const [ejecutivoActualId, setEjecutivoActualId] = useState<string | null>(null);

  const [summary, setSummary] = useState<IPrecintoEstadoSummary[]>([
    { id: 'BODEGA', title: 'En bodega', count: 0, description: 'Disponibles para asignar', colorClass: 'bg-[#424242] text-white', badgeBg: 'bg-[#f2f2f2] text-[#424242]' },
    { id: 'ASIGNADO', title: 'Asignados', count: 0, description: 'En poder del ejecutivo, sin usar', colorClass: 'bg-[#1877f2] text-white', badgeBg: 'bg-[#f2f2f2] text-[#333333]' },
    { id: 'USADO', title: 'Usados', count: 0, description: 'Instalados en devoluciones', colorClass: 'bg-[#c2f012] text-black', badgeBg: 'bg-[#f2f2f2] text-[#333333]' },
    { id: 'ANULADO', title: 'Anulados', count: 0, description: 'Dados de baja, no se pueden reasignar', colorClass: 'bg-[#e6007e] text-white', badgeBg: 'bg-[#f2f2f2] text-[#333333]' },
  ]);

  const [appliedFilters, setAppliedFilters] = useState<IAppliedFilters>({ selectedPeriod: null, selectedExecs: [], selectedClients: [], selectedReasons: [], fromDate: '', toDate: '' });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }, 400); 
    return () => clearTimeout(delayDebounceFn); 
  }, [searchTerm]);

  const fetchSummaryCounts = async () => {
    try {
      const execFiltro = appliedFilters.selectedExecs.length > 0 ? appliedFilters.selectedExecs.join(',') : undefined;
      const clientesFiltro = appliedFilters.selectedClients.length > 0 ? appliedFilters.selectedClients.join(',') : undefined;
      const motivosFiltro = appliedFilters.selectedReasons.length > 0 ? appliedFilters.selectedReasons.join(',') : undefined;

      const [bodega, asignados, usados, anulados] = await Promise.all([
        getPrecintos(1, 1, 'No Asignado', execFiltro, clientesFiltro, appliedFilters.fromDate, appliedFilters.toDate, searchQuery, 1, motivosFiltro, undefined, undefined),
        getPrecintos(1, 1, 'Asignado', execFiltro, clientesFiltro, appliedFilters.fromDate, appliedFilters.toDate, searchQuery, 1, motivosFiltro, undefined, undefined),
        getPrecintos(1, 1, 'Usado', execFiltro, clientesFiltro, appliedFilters.fromDate, appliedFilters.toDate, searchQuery, 1, motivosFiltro, undefined, undefined),
        getPrecintos(1, 1, 'Anulado', execFiltro, clientesFiltro, appliedFilters.fromDate, appliedFilters.toDate, searchQuery, 1, motivosFiltro, undefined, undefined),
      ]);

      setSummary((prev) =>
        prev.map((item) => {
          if (item.id === 'BODEGA') return { ...item, count: bodega.total || 0 };
          if (item.id === 'ASIGNADO') return { ...item, count: asignados.total || 0 };
          if (item.id === 'USADO') return { ...item, count: usados.total || 0 };
          if (item.id === 'ANULADO') return { ...item, count: anulados.total || 0 };
          return item;
        })
      );
    } catch (error) {
      console.error("Error actualizando contadores", error);
    }
  };

  const fetchData = async (precintoDestacado?: string) => {
    try {
      setSeleccionados([]); 
      
      let estadoFiltro = undefined;
      if (expandedState === 'BODEGA') estadoFiltro = 'No Asignado'; 
      else if (expandedState === 'ASIGNADO') estadoFiltro = 'Asignado';
      else if (expandedState === 'USADO') estadoFiltro = 'Usado';
      else if (expandedState === 'ANULADO') estadoFiltro = 'Anulado';

      const execFiltro = appliedFilters.selectedExecs.length > 0 ? appliedFilters.selectedExecs.join(',') : undefined;
      const clientesFiltro = appliedFilters.selectedClients.length > 0 ? appliedFilters.selectedClients.join(',') : undefined;
      const motivosFiltro = appliedFilters.selectedReasons.length > 0 ? appliedFilters.selectedReasons.join(',') : undefined;

      const response = await getPrecintos(
        currentPage, 20, estadoFiltro, execFiltro, clientesFiltro,
        appliedFilters.fromDate, appliedFilters.toDate, searchQuery, groupBy, motivosFiltro,
        sortField, sortOrder 
      );
      
      let nuevosDatos: any[] = [];
      let totalRegistrosBackend = 0;
      if (response && response.data && Array.isArray(response.data)) {
        nuevosDatos = response.data;
        totalRegistrosBackend = response.total || response.data.length;
      } else if (Array.isArray(response)) {
        nuevosDatos = response;
        totalRegistrosBackend = response.length;
      }

      if (precintoDestacado && nuevosDatos.length > 0) {
        const index = nuevosDatos.findIndex((p: any) => 
           p.IdPrecinto === precintoDestacado || p.PrecintosArray?.includes(precintoDestacado)
        );
        
        if (index > -1) {
           const [itemDestacado] = nuevosDatos.splice(index, 1);
           nuevosDatos.unshift(itemDestacado);
        }
      }

      setPrecintos(nuevosDatos);
      setTotalRegistros(totalRegistrosBackend);
    } catch (error) {
      console.error("Error al cargar precintos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEjecutivos = async () => {
    try {
      setIsLoadingEjecutivos(true);
      const data = await getEjecutivosStats();
      const sortedData = (data.data || data);

      if (sortField && sortOrder) {
        sortedData.sort((a: any, b: any) => {
          const valA = a[sortField];
          const valB = b[sortField];
          if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
          if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
          return 0;
        });
      } else {
        sortedData.sort((a: any, b: any) => b.PorcentajeUso - a.PorcentajeUso);
      }

      setEjecutivosData(sortedData);
    } catch (error) {
      console.error("Error cargando ejecutivos", error);
    } finally {
      setIsLoadingEjecutivos(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchSummaryCounts(); 
  }, [
    expandedState, 
    currentPage, 
    appliedFilters.selectedExecs, 
    appliedFilters.selectedClients, 
    appliedFilters.fromDate, 
    appliedFilters.toDate,
    appliedFilters.selectedReasons,
    searchQuery,
    groupBy,
    sortField,
    sortOrder
  ]); 

  useEffect(() => {
    if (activeTab === 'ejecutivos') {
      fetchEjecutivos();
    }
  }, [activeTab, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  const handleToggleAccordion = (id: string) => {
    if (expandedState !== id) {
      setCurrentPage(1);
      setIsLoading(true); 
      setPrecintos([]);   
      setSeleccionados([]); 
    }
    setExpandedState((prev) => (prev === id ? null : id));
  };

  const handleSelectAction = (actionId: string) => {
    setIsActionOpen(false);
    if (actionId === 'ingresar') setIsIngresarOpen(true);
    if (actionId === 'asignar') {
      setCodigosParaAsignar([]); 
      setIsAsignarOpen(true);
    }
    if (actionId === 'mover') {
      if (seleccionados.length === 0) return message.warning('Selecciona al menos un precinto');
      setPrecintosParaAccion(seleccionados);
      setIsCambiarOpen(true);
    }
    if (actionId === 'devolver') {
      if (seleccionados.length === 0) return message.warning('Selecciona al menos un precinto');
      setPrecintosParaAccion(seleccionados);
      setIsDevolverOpen(true);
    }
    if (actionId === 'anular') {
      if (seleccionados.length === 0) return message.warning('Selecciona al menos un precinto');
      setPrecintosParaAnular(seleccionados);
      setIsAnularOpen(true);
    }
  };

  const handleDownloadInventory = async () => {
    try {
      await descargarInventarioCSV();
      message.success('Descargando inventario completo...');
      setIsActionOpen(false);
    } catch (error) {
      message.error('Error al descargar el inventario');
    }
  };

  const handleDownloadFiltered = async () => {
    try {
      let estadoFiltro = undefined;
      if (expandedState === 'BODEGA') estadoFiltro = 'No Asignado'; 
      else if (expandedState === 'ASIGNADO') estadoFiltro = 'Asignado';
      else if (expandedState === 'USADO') estadoFiltro = 'Usado';
      else if (expandedState === 'ANULADO') estadoFiltro = 'Anulado';

      const execFiltro = appliedFilters.selectedExecs.length > 0 ? appliedFilters.selectedExecs.join(',') : undefined;
      const clientesFiltro = appliedFilters.selectedClients.length > 0 ? appliedFilters.selectedClients.join(',') : undefined;

      await descargarFiltradosCSV({
        estado: estadoFiltro,
        ejecutivos: execFiltro,
        clientes: clientesFiltro,
        from: appliedFilters.fromDate,
        to: appliedFilters.toDate,
        search: searchQuery
      });
      
      message.success('Descargando precintos filtrados...');
      setIsActionOpen(false);
    } catch (error) {
      message.error('Error al descargar los precintos filtrados');
    }
  };

  const handleDownloadSelected = async () => {
    try {
      if (seleccionados.length === 0) return;
      await descargarSeleccionCSV(seleccionados);
      message.success('Descargando precintos seleccionados...');
      setIsActionOpen(false);
    } catch (error) {
      message.error('Error al descargar los precintos seleccionados');
    }
  };

  const totalAppliedCount = (appliedFilters.selectedPeriod ? 1 : 0) + appliedFilters.selectedExecs.length + appliedFilters.selectedClients.length + appliedFilters.selectedReasons.length + (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0) + (searchQuery ? 1 : 0);
  const handleClearAllFilters = () => {
    setAppliedFilters({ selectedPeriod: null, selectedExecs: [], selectedClients: [], selectedReasons: [], fromDate: '', toDate: '' });
    setSearchQuery('');
    setSearchTerm('');
  };
  const handleRemovePeriod = () => setAppliedFilters((prev) => ({ ...prev, selectedPeriod: null, fromDate: '', toDate: '' }));
  const handleRemoveExec = (name: string) => setAppliedFilters((prev) => ({ ...prev, selectedExecs: prev.selectedExecs.filter((item) => item !== name) }));
  const handleRemoveClient = (name: string) => setAppliedFilters((prev) => ({ ...prev, selectedClients: prev.selectedClients.filter((item) => item !== name) }));
  const handleRemoveReason = (name: string) => setAppliedFilters((prev) => ({ ...prev, selectedReasons: prev.selectedReasons.filter((item) => item !== name) }));

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-5">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* 👇 BOTONES FLOTANTES (SIN TÍTULO DUPLICADO) 👇 */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Chips de filtros activos */}
            {(appliedFilters.selectedPeriod || appliedFilters.fromDate || appliedFilters.toDate) && (
              <span className="px-3 py-1.5 bg-[#f4fbc5] border border-[#c2f012] text-black text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span><strong className="font-bold">Fecha:</strong> {appliedFilters.selectedPeriod || `${appliedFilters.fromDate || '...'} a ${appliedFilters.toDate || '...'}`}</span>
                <button onClick={handleRemovePeriod} className="hover:text-gray-600 font-bold cursor-pointer text-sm ml-1">✕</button>
              </span>
            )}
            {appliedFilters.selectedExecs.map((exec) => (
              <span key={exec} className="px-3 py-1.5 bg-[#f4fbc5] border border-[#c2f012] text-black text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span><strong className="font-bold">Ejecutivo:</strong> {exec}</span>
                <button onClick={() => handleRemoveExec(exec)} className="hover:text-gray-600 font-bold cursor-pointer text-sm ml-1">✕</button>
              </span>
            ))}
            {appliedFilters.selectedClients.map((client) => (
              <span key={client} className="px-3 py-1.5 bg-[#f4fbc5] border border-[#c2f012] text-black text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span><strong className="font-bold">Cliente:</strong> {client}</span>
                <button onClick={() => handleRemoveClient(client)} className="hover:text-gray-600 font-bold cursor-pointer text-sm ml-1">✕</button>
              </span>
            ))}
            {appliedFilters.selectedReasons.map((reason) => (
              <span key={reason} className="px-3 py-1.5 bg-[#f4fbc5] border border-[#c2f012] text-black text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span><strong className="font-bold">Motivo:</strong> {reason}</span>
                <button onClick={() => handleRemoveReason(reason)} className="hover:text-gray-600 font-bold cursor-pointer text-sm ml-1">✕</button>
              </span>
            ))}
            {searchQuery && (
              <span className="px-3 py-1.5 bg-[#f4fbc5] border border-[#c2f012] text-black text-sm font-medium rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span><strong className="font-bold">Búsqueda:</strong> {searchQuery}</span>
                <button onClick={() => { setSearchQuery(''); setSearchTerm(''); }} className="hover:text-gray-600 font-bold cursor-pointer text-sm ml-1">✕</button>
              </span>
            )}
            {totalAppliedCount > 0 && <button onClick={handleClearAllFilters} className="text-sm font-semibold text-gray-500 hover:text-black transition-colors mr-1 cursor-pointer">Limpiar todos</button>}

            {/* Búsqueda */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none"><SearchIcon /></span>
              <input type="text" placeholder="Precinto, código, rango numérico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 lg:w-72 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 placeholder-gray-400 bg-white shadow-2xs" />
            </div>

            {/* Filtrar */}
            <button onClick={() => setIsFilterOpen(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-normal text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs">
              <FilterIcon /><span>Filtrar</span>
            </button>

            {/* Agrupar */}
            <div className="relative">
              <select 
                value={groupBy} 
                onChange={(e) => {
                  setGroupBy(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-normal text-gray-700 hover:bg-gray-50 appearance-none cursor-pointer shadow-2xs pr-9"
              >
                <option value={1}>Agrupar: Unidad</option>
                <option value={10}>Agrupar: 10 en 10</option>
                <option value={50}>Agrupar: 50 en 50</option>
                <option value={100}>Agrupar: 100 en 100</option>
                <option value={1000}>Agrupar: 1000 en 1000</option>
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-sm">▼</span>
            </div>

            {/* Generar Acción */}
            <button onClick={() => setIsActionOpen(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs">
              <span className="text-[13px] tracking-widest font-extrabold">•••</span><span>Generar acción</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex gap-6">
              <button onClick={() => setActiveTab('precintos')} className={`pb-2 text-sm font-bold transition-colors relative cursor-pointer ${activeTab === 'precintos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Precintos</button>
              <button onClick={() => setActiveTab('ejecutivos')} className={`pb-2 text-sm font-bold transition-colors relative cursor-pointer ${activeTab === 'ejecutivos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}>Ejecutivos</button>
            </div>
          </div>

          {activeTab === 'precintos' && (
            <div className="divide-y divide-gray-100">
              {summary.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center cursor-pointer group py-1" onClick={() => handleToggleAccordion(item.id)}>
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-gray-700 text-sm font-bold select-none w-3">{expandedState === item.id ? '∨' : '>'}</span>
                      <div className="inline-flex items-stretch rounded-xl overflow-hidden">
                        <span className={`px-3.5 py-1.5 text-sm font-bold flex items-center justify-center rounded-l-xl ${item.colorClass}`}>{item.title}</span>
                        <div className={`px-3.5 py-1.5 text-sm font-bold flex items-center gap-2 rounded-r-xl ${item.badgeBg}`}>
                          <PrecintoIcon /><span>{item.count.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400 font-normal ml-2">{item.description}</span>
                    </div>
                  </div>

                  {expandedState === item.id && (
                    <div className="mt-2 pl-7">
                      {isLoading ? (
                        <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Cargando precintos...</div>
                      ) : (
                        <>
                          {item.id === 'BODEGA' && (
                            <div>
                              <BodegaTable 
                                data={precintos} 
                                onSelectionChange={setSeleccionados} 
                                onAsignarEjecutivo={(codigos) => {
                                  setCodigosParaAsignar(codigos); 
                                  setIsAsignarOpen(true);
                                }} 
                                onAnularPrecinto={(codigos) => {
                                  setPrecintosParaAnular(codigos);
                                  setIsAnularOpen(true);
                                }} 
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                              />
                              <Pagination currentPage={currentPage} total={totalRegistros} limit={20} onPageChange={setCurrentPage} />
                            </div>
                          )}
                          
                          {item.id === 'ASIGNADO' && (
                            <div>
                              <AsignadosTable 
                                data={precintos} 
                                onSelectionChange={setSeleccionados} 
                                onMoverEjecutivo={(codigos, actualId) => { 
                                  setPrecintosParaAccion(codigos);
                                  setEjecutivoActualId(actualId); 
                                  setIsCambiarOpen(true);
                                }} 
                                onDevolverBodega={(codigos) => {
                                  setPrecintosParaAccion(codigos);
                                  setIsDevolverOpen(true);
                                }} 
                                onAnularPrecintos={(codigos) => {
                                  setPrecintosParaAnular(codigos);
                                  setIsAnularOpen(true);
                                }} 
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                              />
                              <Pagination currentPage={currentPage} total={totalRegistros} limit={20} onPageChange={setCurrentPage} />
                            </div>
                          )}
                          
                          {item.id === 'USADO' && (
                            <div>
                              <UsadosTable 
                                data={precintos} 
                                onDevolucionClick={(id) => console.log('Navegar a devolución:', id)} 
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                              />
                              <Pagination currentPage={currentPage} total={totalRegistros} limit={20} onPageChange={setCurrentPage} />
                            </div>
                          )}
                          {item.id === 'ANULADO' && (
                            <div>
                              <AnuladosTable 
                                data={precintos} 
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                              />
                              <Pagination currentPage={currentPage} total={totalRegistros} limit={20} onPageChange={setCurrentPage} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ejecutivos' && (
            <div className="mt-2">
              {isLoadingEjecutivos ? (
                <div className="p-8 text-center text-gray-400 text-sm animate-pulse">
                  Cargando estadísticas de ejecutivos...
                </div>
              ) : (
                <EjecutivosTable 
                  data={ejecutivosData} 
                  onVer={(ej) => {
                    setActiveTab('precintos');
                    setAppliedFilters((prev) => ({ ...prev, selectedExecs: [ej.EjecutivoNombre] }));
                    setExpandedState('ASIGNADO');
                    setCurrentPage(1); 
                  }}
                  onMover={async (ej) => {
                    try {
                      message.loading({ content: 'Cargando precintos...', key: 'mover' });
                      const response = await getPrecintos(
                        1, 1000, 'Asignado', ej.EjecutivoNombre, undefined, undefined, undefined, undefined, 1, undefined
                      );
                      const listaCodigos = response.data?.map((p: any) => p.IdPrecinto) || [];

                      if (listaCodigos.length === 0) {
                        message.warning({ content: 'Este ejecutivo no tiene precintos asignados', key: 'mover' });
                        return;
                      }

                      setPrecintosParaMover(listaCodigos);
                      setIsMoverOpen(true);
                      message.destroy('mover');
                    } catch (error) {
                      console.error("Error al cargar precintos para mover:", error);
                      message.error({ content: 'Error al cargar los precintos', key: 'mover' });
                    }
                  }}
                  onSort={handleSort}
                  sortField={sortField}
                  sortOrder={sortOrder}
                />
              )}
            </div>
          )}

        </div>

        <FiltersModal 
          key={JSON.stringify(appliedFilters)} 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
          onApply={(filters) => { 
            setAppliedFilters(filters); 
            setIsFilterOpen(false); 
          }} 
          initialFilters={appliedFilters} 
        />
        
        <ActionModal 
          isOpen={isActionOpen} 
          onClose={() => setIsActionOpen(false)} 
          onSelectAction={handleSelectAction} 
          selectedCount={seleccionados.length} 
          totalCount={totalRegistros}
          onMover={() => { setIsActionOpen(false); handleSelectAction('mover'); }} 
          onDevolver={() => { setIsActionOpen(false); handleSelectAction('devolver'); }} 
          onAnular={() => { setIsActionOpen(false); handleSelectAction('anular'); }} 
          onDownloadInventory={handleDownloadInventory}
          onDownloadFiltered={handleDownloadFiltered}
          onDownloadSelected={handleDownloadSelected} 
        />
        
        <IngresarBodegaModal isOpen={isIngresarOpen} onClose={() => setIsIngresarOpen(false)} onSuccess={() => { setIsIngresarOpen(false); fetchData(); }} />
        
        <AsignarEjecutivoModal 
          isOpen={isAsignarOpen} 
          onClose={() => {
            setIsAsignarOpen(false);
            setCodigosParaAsignar([]); 
          }} 
          onSuccess={() => { 
            setIsAsignarOpen(false); 
            setCodigosParaAsignar([]); 
            fetchData(codigosParaAsignar[0]); 
          }} 
          codigosIniciales={codigosParaAsignar} 
        />

        <CambiarPrecintoModal 
          isOpen={isCambiarOpen} 
          onClose={() => {
            setIsCambiarOpen(false);
            setPrecintosParaAccion([]);
            setEjecutivoActualId(null);
          }} 
          onSuccess={() => { 
            setIsCambiarOpen(false); 
            setPrecintosParaAccion([]); 
            setEjecutivoActualId(null);
            fetchData(precintosParaAccion[0]); 
          }} 
          precintosSeleccionados={precintosParaAccion} 
          ejecutivoActualId={ejecutivoActualId} 
        />
        
        <DevolverPrecintosModal 
          isOpen={isDevolverOpen} 
          onClose={() => {
            setIsDevolverOpen(false);
            setPrecintosParaAccion([]);
          }} 
          onSuccess={() => { 
            setIsDevolverOpen(false); 
            setPrecintosParaAccion([]); 
            fetchData(precintosParaAccion[0]); 
          }} 
          precintosSeleccionados={precintosParaAccion} 
        />

        <AnularPrecintosModal 
          isOpen={isAnularOpen} 
          onClose={() => {
            setIsAnularOpen(false);
            setPrecintosParaAnular([]);
          }} 
          onSuccess={() => { 
            setIsAnularOpen(false); 
            setPrecintosParaAnular([]); 
            fetchData(precintosParaAnular[0]); 
            fetchEjecutivos();
          }} 
          precintosSeleccionados={precintosParaAnular} 
        />

        <MoverPrecintosModal 
          isOpen={isMoverOpen} 
          onClose={() => {
            setIsMoverOpen(false);
            setPrecintosParaMover([]);
          }} 
          onSuccess={() => { 
            setIsMoverOpen(false); 
            setPrecintosParaMover([]); 
            fetchData(); 
            fetchEjecutivos(); 
          }} 
          precintosSeleccionados={precintosParaMover} 
          ejecutivosList={ejecutivosData} 
        />
      </div>
    </div>
  );
};