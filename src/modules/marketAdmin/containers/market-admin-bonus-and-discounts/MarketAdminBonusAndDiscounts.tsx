"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import useSWR from "swr";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import CrearNuevoModal from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/CrearNuevoModal";
import { getAllDiscountPackages } from "@/services/discount/discount.service";
import { useAppStore } from "@/lib/store/store";
import { DiscountPackage } from "@/types/discount/DiscountPackage";
import ProfitLoader from "@/components/ui/profit-loader";

const ESTADO_STYLES: Record<string, string> = {
  Activo: "bg-[#E8F9E8] text-[#1A7A1A]",
  Inactivo: "bg-[#F0F0F0] text-[#999999]"
};

const TIPO_STYLES: Record<string, string> = {
  Flex: "bg-[#141414] text-white",
  "Promos Mes": "bg-[#F5F0FF] text-[#7C4DFF]"
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
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

  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: discountsData, isLoading } = useSWR(ID ? { id: ID } : null, ({ id }) =>
    getAllDiscountPackages({ projectId: id })
  );

  const descuentos = discountsData?.data ?? [];

  const getStatusLabel = (active: number) => (active === 1 ? "Activo" : "Inactivo");

  const tipos = useMemo(
    () => Array.from(new Set(descuentos.map((d) => d.discountType).filter(Boolean))),
    [descuentos]
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
      descuentos.filter((d) => {
        const matchSearch = (d.name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchTipo = tipoFilter === "Todos" || d.discountType === tipoFilter;
        const matchEstado = estadoFilter === "Todos" || getStatusLabel(d.active) === estadoFilter;
        return matchSearch && matchTipo && matchEstado;
      }),
    [search, tipoFilter, estadoFilter, descuentos]
  );

  const activos = filtered.filter((d) => d.active === 1).length;

  function runAccion(accion: string) {
    setShowAcciones(false);
    const count = selectedRowKeys.length;
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${count} bonificado(s).`);
  }

  const columns: ColumnsType<DiscountPackage> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Tipo",
      dataIndex: "discountType",
      key: "discountType",
      width: 130,
      sorter: (a, b) => a.discountType.localeCompare(b.discountType),
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
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{formatDate(v)}</span>
    },
    {
      title: "Fin",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) =>
        v ? (
          <span className="text-sm text-[#141414]">{formatDate(v)}</span>
        ) : (
          <span className="text-sm text-[#999999]">—</span>
        )
    },
    {
      title: "Reglas",
      dataIndex: "reglas",
      key: "reglas",
      width: 90,
      onHeaderCell: headerCell,
      render: () => <span className="text-sm text-[#141414]">-</span>
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      width: 110,
      sorter: (a, b) => a.active - b.active,
      onHeaderCell: headerCell,
      render: (active: number) => {
        const label = getStatusLabel(active);
        return (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ESTADO_STYLES[label] ?? ""}`}
          >
            {label}
          </span>
        );
      }
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: () => <GenericEyeButton />
    }
  ];

  if (showPromotions) {
    return <MarketAdminPromotions onBack={() => setShowPromotions(false)} />;
  }

  if (isLoading) {
    return <ProfitLoader />;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Descuentos y bonificados</h1>

      <div className="bg-white rounded-lg overflow-hidden p-8 [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
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
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
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
