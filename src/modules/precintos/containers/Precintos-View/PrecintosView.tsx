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
import Header from '@/components/organisms/header';
import { FilterButton, FilterChips, HeaderSearch } from '@/components/ui/page-header-controls/page-header-controls';
import UiTab from '@/components/ui/ui-tab';
import Collapse from '@/components/ui/collapse';
import LabelCollapse from '@/components/ui/label-collapse';
import Pagination from '@/components/ui/pagination';
import { GenerateActionButton } from '@/components/atoms/GenerateActionButton';

const PAGE_SIZE = 20;

/* Paginación + contador al pie de la tabla, a la derecha (DESIGN.md §7). */
const TableFooter = ({ currentPage, total, onPageChange }: { currentPage: number, total: number, onPageChange: (p: number) => void }) => {
  if (total === 0) return null;
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);
  return (
    <div className="mt-3 flex items-center justify-end gap-4">
      <Pagination currentPage={currentPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={onPageChange} showResultsText={false} />
      <span className="text-[13px] text-cp-ink-3">{from.toLocaleString('es-CO')}–{to.toLocaleString('es-CO')} de {total.toLocaleString('es-CO')} precintos</span>
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
    { id: 'BODEGA', title: 'En bodega', count: 0, description: 'Disponibles para asignar', colorClass: '#4a4a4a', badgeBg: '' },
    { id: 'ASIGNADO', title: 'Asignados', count: 0, description: 'En poder del ejecutivo, sin usar', colorClass: '#1677ff', badgeBg: '' },
    { id: 'USADO', title: 'Usados', count: 0, description: 'Instalados en devoluciones', colorClass: '#9bb514', badgeBg: '' },
    { id: 'ANULADO', title: 'Anulados', count: 0, description: 'Dados de baja, no se pueden reasignar', colorClass: '#e0007a', badgeBg: '' },
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

  const totalAppliedCount = (appliedFilters.selectedPeriod ? 1 : 0) + appliedFilters.selectedExecs.length + appliedFilters.selectedClients.length + appliedFilters.selectedReasons.length + (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0);
  const handleRemovePeriod = () => setAppliedFilters((prev) => ({ ...prev, selectedPeriod: null, fromDate: '', toDate: '' }));

  // Chips a la izquierda de Filtrar, uno por categoría (DESIGN.md §4).
  const filterChips = [
    ...((appliedFilters.selectedPeriod || appliedFilters.fromDate || appliedFilters.toDate)
      ? [{ key: 'fecha', label: 'Fecha', value: appliedFilters.selectedPeriod || `${appliedFilters.fromDate || '...'} a ${appliedFilters.toDate || '...'}`, onRemove: handleRemovePeriod }]
      : []),
    ...(appliedFilters.selectedExecs.length ? [{ key: 'ejecutivo', label: 'Ejecutivo', value: appliedFilters.selectedExecs.join(', '), onRemove: () => setAppliedFilters((prev) => ({ ...prev, selectedExecs: [] })) }] : []),
    ...(appliedFilters.selectedClients.length ? [{ key: 'cliente', label: 'Cliente', value: appliedFilters.selectedClients.join(', '), onRemove: () => setAppliedFilters((prev) => ({ ...prev, selectedClients: [] })) }] : []),
    ...(appliedFilters.selectedReasons.length ? [{ key: 'motivo', label: 'Motivo', value: appliedFilters.selectedReasons.join(', '), onRemove: () => setAppliedFilters((prev) => ({ ...prev, selectedReasons: [] })) }] : []),
  ];

  // Acciones del módulo a la derecha de la fila de pestañas, todas a 36px (DESIGN.md §7b y §8).
  const tabActions = (
    <div className="flex items-center gap-3">
      {activeTab === 'precintos' && (
        <div className="relative">
          <select
            value={groupBy}
            onChange={(e) => {
              setGroupBy(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="cp-control-fill h-[var(--control-h)] cursor-pointer appearance-none rounded-lg border-0 pl-3.5 pr-9 text-[14px] text-cp-ink outline-none"
          >
            <option value={1}>Agrupar: unidad</option>
            <option value={10}>Agrupar: de 10 en 10</option>
            <option value={50}>Agrupar: de 50 en 50</option>
            <option value={100}>Agrupar: de 100 en 100</option>
            <option value={1000}>Agrupar: de 1.000 en 1.000</option>
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cp-ink-4" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      )}
      <GenerateActionButton onClick={() => setIsActionOpen(true)} />
    </div>
  );

  // Grupos por estado iguales a Saldos: Collapse + LabelCollapse (DESIGN.md §7b).
  const precintosTab = (
    <Collapse
      accordion
      activeKey={expandedState ?? []}
      onChange={(key) => {
        const next = Array.isArray(key) ? key[key.length - 1] : key;
        handleToggleAccordion((next as string) ?? expandedState ?? '');
      }}
      items={summary.map((item) => ({
        key: item.id,
        label: (
          <div className="flex min-w-0 items-center gap-3">
            <LabelCollapse status={item.title} color={item.colorClass} quantity={item.count} />
            <span className="truncate text-[13px] text-cp-ink-3">{item.description}</span>
          </div>
        ),
        children: expandedState !== item.id ? null : isLoading ? (
          <div className="p-8 text-center text-[13px] text-cp-ink-3">Cargando precintos...</div>
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
              <TableFooter currentPage={currentPage} total={totalRegistros} onPageChange={setCurrentPage} />
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
              <TableFooter currentPage={currentPage} total={totalRegistros} onPageChange={setCurrentPage} />
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
              <TableFooter currentPage={currentPage} total={totalRegistros} onPageChange={setCurrentPage} />
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
              <TableFooter currentPage={currentPage} total={totalRegistros} onPageChange={setCurrentPage} />
            </div>
          )}
          </>
        ),
      }))}
    />
  );

  const ejecutivosTab = isLoadingEjecutivos ? (
    <div className="p-8 text-center text-[13px] text-cp-ink-3">Cargando estadísticas de ejecutivos...</div>
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
  );

  return (
    <div className="cp-page">
      <Header
        title="Precintos"
        actionsExtra={
          <>
            <FilterChips chips={filterChips} />
            <FilterButton onClick={() => setIsFilterOpen(true)} count={totalAppliedCount} />
            <HeaderSearch placeholder="Precinto, código o rango" value={searchTerm} onChange={setSearchTerm} />
          </>
        }
      />

      <section className="cp-card p-6">
        <UiTab
          activeKey={activeTab}
          onChangeTab={(key) => setActiveTab(key as 'precintos' | 'ejecutivos')}
          tabBarExtraContent={tabActions}
          tabs={[
            { key: 'precintos', label: 'Precintos', children: precintosTab },
            { key: 'ejecutivos', label: 'Ejecutivos', children: ejecutivosTab },
          ]}
        />
      </section>

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
  );
};