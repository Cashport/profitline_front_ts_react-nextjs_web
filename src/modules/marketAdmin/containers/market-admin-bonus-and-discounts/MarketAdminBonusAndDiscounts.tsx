"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Eye, ChevronLeft } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
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

type Bonificado = (typeof BONIFICADOS_MOCK)[number];

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

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function MarketAdminBonusAndDiscounts() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

  const filtered = useMemo(
    () =>
      BONIFICADOS_MOCK.filter((b) => {
        const matchSearch = b.nombre.toLowerCase().includes(search.toLowerCase());
        const matchTipo = tipoFilter === "Todos" || b.tipo === tipoFilter;
        const matchEstado = estadoFilter === "Todos" || b.estado === estadoFilter;
        return matchSearch && matchTipo && matchEstado;
      }),
    [search, tipoFilter, estadoFilter]
  );

  const activos = filtered.filter((b) => b.estado === "Activo").length;

  function runAccion(accion: string) {
    setShowAcciones(false);
    const count = selectedRowKeys.length;
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${count} bonificado(s).`);
  }

  const columns: ColumnsType<Bonificado> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 130,
      sorter: (a, b) => a.tipo.localeCompare(b.tipo),
      onHeaderCell: headerCell,
      render: (tipo: string) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${TIPO_STYLES[tipo] ?? "bg-[#F0F0F0] text-[#666666]"}`}
        >
          {tipo}
        </span>
      )
    },
    {
      title: "Inicio",
      dataIndex: "inicio",
      key: "inicio",
      sorter: (a, b) => a.inicio.localeCompare(b.inicio),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{formatDate(v)}</span>
    },
    {
      title: "Fin",
      dataIndex: "fin",
      key: "fin",
      sorter: (a, b) => a.fin.localeCompare(b.fin),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{formatDate(v)}</span>
    },
    {
      title: "Reglas",
      dataIndex: "reglas",
      key: "reglas",
      width: 90,
      sorter: (a, b) => a.reglas - b.reglas,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 110,
      sorter: (a, b) => a.estado.localeCompare(b.estado),
      onHeaderCell: headerCell,
      render: (estado: string) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ESTADO_STYLES[estado] ?? ""}`}
        >
          {estado}
        </span>
      )
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: () => (
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#BBBBBB] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  if (showPromotions) {
    return <MarketAdminPromotions onBack={() => setShowPromotions(false)} />;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Descuentos y bonificados</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden [&_.ant-table-pagination]:px-6">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#EEEEEE]">
          <Link
            href="/market-admin"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
          <UiSearchInput
            placeholder="Buscar..."
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="relative" ref={accionesRef}>
            <GenerateActionButton
              disabled={selectedRowKeys.length === 0}
              onClick={() => selectedRowKeys.length > 0 && setShowAcciones((v) => !v)}
            />
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

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron bonificados." }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          onRow={(record) => ({
            onClick: (e) => {
              // The selection checkbox handles its own toggle — don't double-toggle
              if ((e.target as HTMLElement).closest(".ant-table-selection-column")) return;
              setSelectedRowKeys((prev) =>
                prev.includes(record.id) ? prev.filter((k) => k !== record.id) : [...prev, record.id]
              );
            },
            className: "cursor-pointer"
          })}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} bonificados · ${activos} activos`
          }}
          onChange={(pag, _filters, _sorter, extra) =>
            setPage(extra.action === "paginate" ? pag.current ?? 1 : 1)
          }
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
