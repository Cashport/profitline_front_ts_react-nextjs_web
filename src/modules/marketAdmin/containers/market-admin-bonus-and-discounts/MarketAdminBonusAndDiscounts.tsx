"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Eye, ChevronLeft, MoreHorizontal } from "lucide-react";
import {
  SortableHeader,
  Pagination,
  AdminCheckbox,
  type SortDir
} from "@/modules/marketAdmin/components/admin-table/AdminTable";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import CrearNuevoModal from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/CrearNuevoModal";

const BONIFICADOS_MOCK = [
  {
    id: "b1",
    nombre: "Flex Q2 2025 — Rellenos",
    tipo: "Flex",
    inicio: "2025-04-01",
    fin: "2025-06-30",
    estado: "Activo",
    reglas: 3
  },
  {
    id: "b2",
    nombre: "Face Renew 360",
    tipo: "Promos Mes",
    inicio: "2025-06-01",
    fin: "2025-06-30",
    estado: "Activo",
    reglas: 2
  }
];

const ESTADO_STYLES: Record<string, string> = {
  Activo: "bg-[#E8F9E8] text-[#1A7A1A]",
  Vencido: "bg-[#F0F0F0] text-[#999999]",
  Borrador: "bg-[#FFF8E1] text-[#B8860B]"
};

const TIPO_STYLES: Record<string, string> = {
  Flex: "bg-[#141414] text-white",
  "Promos Mes": "bg-[#F5F0FF] text-[#7C4DFF]"
};

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
  ];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const PAGE_SIZE = 10;

export default function MarketAdminBonusAndDiscounts() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAcciones, setShowAcciones] = useState(false);
  const [crearOpen, setCrearOpen] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accionesRef.current && !accionesRef.current.contains(e.target as Node))
        setShowAcciones(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let rows = BONIFICADOS_MOCK.filter((b) => {
      const matchSearch = b.nombre.toLowerCase().includes(search.toLowerCase());
      const matchTipo = tipoFilter === "Todos" || b.tipo === tipoFilter;
      const matchEstado = estadoFilter === "Todos" || b.estado === estadoFilter;
      return matchSearch && matchTipo && matchEstado;
    });
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const av = (a as any)[sortKey],
          bv = (b as any)[sortKey];
        const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [search, tipoFilter, estadoFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activos = filtered.filter((b) => b.estado === "Activo").length;
  const pageIds = paginated.map((b) => b.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = pageIds.some((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function runAccion(accion: string) {
    setShowAcciones(false);
    setSelected(new Set());
    alert(`Acción "${accion}" aplicada a ${selected.size} bonificado(s).`);
  }

  const cols = "grid-cols-[24px_2fr_110px_1fr_1fr_60px_90px_44px]";

  if (showPromotions) {
    return <MarketAdminPromotions onBack={() => setShowPromotions(false)} />;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Descuentos y bonificados</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#EEEEEE]">
          <Link
            href="/market-admin"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E0E0E0] rounded-lg outline-none focus:border-[#141414] transition-colors placeholder:text-[#BBBBBB]"
            />
          </div>
          <div className="relative" ref={accionesRef}>
            <button
              onClick={() => selected.size > 0 && setShowAcciones((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selected.size > 0
                  ? "border-[#CCCCCC] bg-white text-[#141414] hover:bg-[#F5F5F5]"
                  : "border-[#E0E0E0] bg-white text-[#999999] cursor-not-allowed"
              }`}
            >
              <MoreHorizontal size={15} />
              Generar acción
              {selected.size > 0 && (
                <span className="bg-[#141414] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                  {selected.size}
                </span>
              )}
            </button>
            {showAcciones && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-30 w-48 py-1">
                <button
                  onClick={() => runAccion("Activar")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
                >
                  Activar
                </button>
                <button
                  onClick={() => runAccion("Vencer")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
                >
                  Marcar como vencido
                </button>
                <div className="h-px bg-[#EEEEEE] my-1" />
                <button
                  onClick={() => runAccion("Exportar")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
                >
                  Exportar selección
                </button>
              </div>
            )}
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#555555] outline-none focus:border-[#141414] transition-colors"
          >
            <option value="Todos">Tipo</option>
            <option value="Flex">Flex</option>
            <option value="Promos Mes">Promos Mes</option>
          </select>
          <select
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#555555] outline-none focus:border-[#141414] transition-colors"
          >
            <option value="Todos">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Vencido">Vencido</option>
            <option value="Borrador">Borrador</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={() => setCrearOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#CBE71E] text-[#141414] rounded-lg text-sm font-semibold hover:bg-[#b8d11a] transition-colors"
          >
            <Plus size={14} /> Crear nuevo
          </button>
        </div>

        <div className={`grid ${cols} gap-4 px-6 py-3.5 border-b border-[#E8E8E8] items-center`}>
          <AdminCheckbox
            checked={allChecked}
            indeterminate={someChecked && !allChecked}
            onChange={toggleAll}
          />
          <SortableHeader
            label="Nombre"
            sortKey="nombre"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortableHeader
            label="Tipo"
            sortKey="tipo"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortableHeader
            label="Inicio"
            sortKey="inicio"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortableHeader
            label="Fin"
            sortKey="fin"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortableHeader
            label="Reglas"
            sortKey="reglas"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <SortableHeader
            label="Estado"
            sortKey="estado"
            currentKey={sortKey}
            currentDir={sortDir}
            onSort={handleSort}
          />
          <span />
        </div>

        {paginated.map((b) => (
          <div
            key={b.id}
            onClick={() => toggleOne(b.id)}
            className={`grid ${cols} gap-4 px-6 py-[18px] border-b border-[#EEEEEE] last:border-0 items-center cursor-pointer transition-colors hover:bg-[#FAFAFA]`}
          >
            <AdminCheckbox
              checked={selected.has(b.id)}
              onChange={() => toggleOne(b.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm text-[#141414]">{b.nombre}</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${TIPO_STYLES[b.tipo] ?? "bg-[#F0F0F0] text-[#666666]"}`}
            >
              {b.tipo}
            </span>
            <span className="text-sm text-[#141414]">{formatDate(b.inicio)}</span>
            <span className="text-sm text-[#141414]">{formatDate(b.fin)}</span>
            <span className="text-sm text-[#141414]">{b.reglas}</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ESTADO_STYLES[b.estado] ?? ""}`}
            >
              {b.estado}
            </span>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#BBBBBB] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors"
            >
              <Eye size={15} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-[#999999] text-center py-12">No se encontraron bonificados.</p>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          label="bonificados"
          extra={`${activos} activos`}
        />
      </div>

      <CrearNuevoModal
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onSelectBonificado={() => {
          setCrearOpen(false);
          setShowPromotions(true);
        }}
      />
    </div>
  );
}
