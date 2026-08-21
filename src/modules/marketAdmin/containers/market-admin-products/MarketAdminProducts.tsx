"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronLeft, Package } from "lucide-react";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMarketAdminProducts } from "@/modules/marketAdmin/hooks/useMarketAdminProducts";
import FilterProductsModal, {
  IMarketAdminProductsFilter
} from "@/modules/marketAdmin/components/market-admin-products/FilterProductsModal";
import { IMarketAdminProduct } from "@/types/marketAdmin/IMarketAdmin";

const PAGE_SIZE = 10;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

function ProductImageCell({ producto }: { producto: IMarketAdminProduct }) {
  const hasImage = producto.image && producto.image !== ".";
  return (
    <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] overflow-hidden flex items-center justify-center flex-shrink-0">
      {hasImage ? (
        <img
          src={producto.image}
          alt={producto.description}
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
  const [filter, setFilter] = useState<IMarketAdminProductsFilter>({
    lineId: null,
    categoryId: null,
    status: null
  });
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  const {
    data: productsData,
    pagination,
    isLoading
  } = useMarketAdminProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    lineId: filter.lineId ?? undefined,
    categoryId: filter.categoryId ?? undefined,
    status: filter.status ?? undefined
  });

  function handleFilterChange(next: IMarketAdminProductsFilter) {
    setFilter(next);
    setPage(1);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accionesRef.current && !accionesRef.current.contains(e.target as Node))
        setShowAcciones(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function runAccion(accion: string) {
    setShowAcciones(false);
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${selectedRowKeys.length} producto(s).`);
  }

  const columns: ColumnsType<IMarketAdminProduct> = [
    {
      title: "",
      key: "imagen",
      width: 56,
      onHeaderCell: headerCell,
      render: (_, p) => <ProductImageCell producto={p} />
    },
    {
      title: "Producto",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      onHeaderCell: headerCell,
      render: (_, p) => (
        <div>
          <p className="text-sm text-[#141414] leading-snug">{p.description}</p>
          {p.price ? (
            <p className="text-xs text-[#999999]">$ {p.price.toLocaleString("es-CO")}</p>
          ) : null}
        </div>
      )
    },
    {
      title: "Línea",
      dataIndex: "line_name",
      key: "line_name",
      sorter: (a, b) => a.line_name.localeCompare(b.line_name),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Canal",
      key: "canal",
      onHeaderCell: headerCell,
      render: () => <span className="text-sm text-[#141414]">-</span>
    },
    {
      title: "SKUs",
      dataIndex: "product_units",
      key: "product_units",
      width: 80,
      sorter: (a, b) => a.product_units - b.product_units,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "is_available",
      key: "is_available",
      width: 100,
      sorter: (a, b) => Number(a.is_available) - Number(b.is_available),
      onHeaderCell: headerCell,
      render: (isAvailable: 1 | 0) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${
            isAvailable === 1 ? "bg-[#E8F9E8] text-[#1A7A1A]" : "bg-[#F0F0F0] text-[#999999]"
          }`}
        >
          {isAvailable === 1 ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, p) => <GenericEyeButton href={`/market-admin/productos/${p.id}`} />
    }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Productos</h1>

      <div className="bg-white rounded-lg overflow-hidden p-8 [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/market-admin"
            className="flex items-center justify-start w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
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
          {/* Generar acción */}
          <div className="relative" ref={accionesRef}>
            <GenerateActionButton
              disabled={selectedRowKeys.length === 0}
              onClick={() => selectedRowKeys.length > 0 && setShowAcciones((v) => !v)}
            />
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
          <FilterProductsModal value={filter} onChange={handleFilterChange} />
        </div>

        <Table
          columns={columns}
          dataSource={productsData}
          rowKey="id"
          loading={isLoading}
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
            total: pagination.totalRows,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) => `Mostrando ${range[0]}–${range[1]} de ${total} productos`
          }}
          onChange={(pag, _filters, _sorter, extra) => {
            if (extra.action === "paginate") setPage(pag.current ?? 1);
          }}
        />
      </div>
    </div>
  );
}
