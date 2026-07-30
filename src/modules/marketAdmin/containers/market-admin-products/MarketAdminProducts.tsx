"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, Eye, ChevronLeft, MoreHorizontal, Package } from "lucide-react";
import {
  PRODUCTOS_ADMIN_MOCK,
  formatPrice,
  type ProductoAdminMock
} from "@/modules/marketAdmin/mocks/products";

const PAGE_SIZE = 10;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

function ProductImageCell({ producto }: { producto: ProductoAdminMock }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] overflow-hidden flex items-center justify-center flex-shrink-0">
      {producto.imagen ? (
        <img
          src={producto.imagen}
          alt={producto.nombreVisible}
          width={36}
          height={36}
          className="object-contain"
        />
      ) : (
        <Package size={16} className="text-[#BBBBBB]" />
      )}
    </div>
  );
}

export default function MarketAdminProducts() {
  const [search, setSearch] = useState("");
  const [lineaFilter, setLineaFilter] = useState("Todas");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  const lineas = useMemo(
    () => Array.from(new Set(PRODUCTOS_ADMIN_MOCK.map((p) => p.linea))),
    []
  );

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
      PRODUCTOS_ADMIN_MOCK.filter((p) => {
        const matchSearch =
          p.nombre.toLowerCase().includes(search.toLowerCase()) ||
          p.nombreVisible.toLowerCase().includes(search.toLowerCase());
        const matchLinea = lineaFilter === "Todas" || p.linea === lineaFilter;
        const matchEstado =
          estadoFilter === "Todos" || (estadoFilter === "Activo" ? p.activo : !p.activo);
        return matchSearch && matchLinea && matchEstado;
      }),
    [search, lineaFilter, estadoFilter]
  );

  const activos = filtered.filter((p) => p.activo).length;

  function runAccion(accion: string) {
    setShowAcciones(false);
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${selectedRowKeys.length} producto(s).`);
  }

  const columns: ColumnsType<ProductoAdminMock> = [
    {
      title: "",
      key: "imagen",
      width: 56,
      onHeaderCell: headerCell,
      render: (_, p) => <ProductImageCell producto={p} />
    },
    {
      title: "Producto",
      dataIndex: "nombreVisible",
      key: "nombreVisible",
      sorter: (a, b) => a.nombreVisible.localeCompare(b.nombreVisible),
      onHeaderCell: headerCell,
      render: (_, p) => (
        <div>
          <p className="text-sm text-[#141414] leading-snug">{p.nombreVisible}</p>
          <p className="text-[11px] text-[#AAAAAA] mt-0.5">{formatPrice(p.precioBase)}</p>
        </div>
      )
    },
    {
      title: "Línea",
      dataIndex: "linea",
      key: "linea",
      sorter: (a, b) => a.linea.localeCompare(b.linea),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Canal",
      dataIndex: "canal",
      key: "canal",
      sorter: (a, b) => a.canal.localeCompare(b.canal),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "SKUs",
      dataIndex: "skus",
      key: "skus",
      width: 80,
      sorter: (a, b) => a.skus - b.skus,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      width: 100,
      sorter: (a, b) => Number(a.activo) - Number(b.activo),
      onHeaderCell: headerCell,
      render: (activo: boolean) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${
            activo ? "bg-[#E8F9E8] text-[#1A7A1A]" : "bg-[#F0F0F0] text-[#999999]"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, p) => (
        <Link
          href={`/market-admin/productos/${p.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#BBBBBB] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors"
        >
          <Eye size={15} />
        </Link>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Productos</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden [&_.ant-table-pagination]:px-6">
        {/* Toolbar */}
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
          {/* Generar acción */}
          <div className="relative" ref={accionesRef}>
            <button
              onClick={() => selectedRowKeys.length > 0 && setShowAcciones((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedRowKeys.length > 0
                  ? "border-[#CCCCCC] bg-white text-[#141414] hover:bg-[#F5F5F5]"
                  : "border-[#E0E0E0] bg-white text-[#999999] cursor-not-allowed"
              }`}
            >
              <MoreHorizontal size={15} />
              Generar acción
              {selectedRowKeys.length > 0 && (
                <span className="bg-[#141414] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                  {selectedRowKeys.length}
                </span>
              )}
            </button>
            {showAcciones && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-30 w-48 py-1">
                <button
                  onClick={() => runAccion("Activar")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Activar
                </button>
                <button
                  onClick={() => runAccion("Inactivar")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Inactivar
                </button>
                <div className="h-px bg-[#EEEEEE] my-1" />
                <button
                  onClick={() => runAccion("Exportar")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Exportar selección
                </button>
              </div>
            )}
          </div>
          <select
            value={lineaFilter}
            onChange={(e) => {
              setLineaFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#555555] outline-none focus:border-[#141414] transition-colors"
          >
            <option value="Todas">Línea</option>
            {lineas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
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
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron productos." }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          onRow={(record) => ({
            onClick: (e) => {
              // The selection checkbox handles its own toggle — don't double-toggle
              if ((e.target as HTMLElement).closest(".ant-table-selection-column")) return;
              setSelectedRowKeys((prev) =>
                prev.includes(record.id)
                  ? prev.filter((k) => k !== record.id)
                  : [...prev, record.id]
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
              `Mostrando ${range[0]}–${range[1]} de ${total} productos · ${activos} activos`
          }}
          onChange={(pag, _filters, _sorter, extra) =>
            setPage(extra.action === "paginate" ? pag.current ?? 1 : 1)
          }
        />
      </div>
    </div>
  );
}
