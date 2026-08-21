"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronLeft } from "lucide-react";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminClients } from "@/modules/marketAdmin/hooks/useMarketAdminClients";
import { updateMarketAdminClientsBatch } from "@/services/marketAdmin/marketAdmin";
import { IMarketAdminClient } from "@/types/marketAdmin/IMarketAdmin";
import { LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";

function LineasBadges({ lineas }: { lineas: string[] }) {
  return (
    <div className="flex items-center">
      {lineas.map((l, i) => {
        const c = LINEA_COLORS[l] ?? { bg: "#AAAAAA", text: "#fff" };
        return (
          <span
            key={l}
            title={l}
            style={{
              backgroundColor: c.bg,
              color: c.text,
              marginLeft: i === 0 ? 0 : -6,
              zIndex: lineas.length - i,
              position: "relative"
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white flex-shrink-0"
          >
            {lineaAbrev(l)}
          </span>
        );
      })}
    </div>
  );
}

const PAGE_SIZE = 20;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

const splitLineas = (lineas: string | null) =>
  lineas
    ?.split(",")
    .map((l) => l.trim())
    .filter(Boolean) ?? [];

export default function MarketAdminClients() {
  const { showMessage } = useMessageApi();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [lineaFilter, setLineaFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const [isRunningAccion, setIsRunningAccion] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  const {
    data: clientes,
    pagination,
    isLoading,
    mutate
  } = useMarketAdminClients({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: estadoFilter === "Todos" ? undefined : estadoFilter === "Activo" ? 1 : 0,
    linea: lineaFilter === "Todas" ? undefined : lineaFilter
  });

  // Opciones tomadas de la página actual (mismo criterio que el listado de productos).
  const lineas = useMemo(
    () => Array.from(new Set(clientes.flatMap((c) => splitLineas(c.lineas)))),
    [clientes]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accionesRef.current && !accionesRef.current.contains(e.target as Node))
        setShowAcciones(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activos = clientes.filter((c) => c.is_active === 1).length;

  async function runAccionEstado(action: "activate" | "inactivate") {
    setShowAcciones(false);
    try {
      setIsRunningAccion(true);
      await updateMarketAdminClientsBatch({
        client_ids: selectedRowKeys.map(String),
        action
      });
      await mutate();
      setSelectedRowKeys([]);
      showMessage(
        "success",
        `${selectedRowKeys.length} cliente(s) ${action === "activate" ? "activados" : "inactivados"} correctamente.`
      );
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Ocurrió un error al actualizar los clientes."
      );
    } finally {
      setIsRunningAccion(false);
    }
  }

  function runAccion(accion: string) {
    setShowAcciones(false);
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${selectedRowKeys.length} cliente(s).`);
  }

  const columns: ColumnsType<IMarketAdminClient> = [
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => (a.city ?? "").localeCompare(b.city ?? ""),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v || "—"}</span>
    },
    {
      title: "Usuarios",
      dataIndex: "usuarios_count",
      key: "usuarios_count",
      width: 110,
      sorter: (a, b) => a.usuarios_count - b.usuarios_count,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Productos",
      dataIndex: "productos_count",
      key: "productos_count",
      width: 110,
      sorter: (a, b) => a.productos_count - b.productos_count,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Líneas",
      dataIndex: "lineas",
      key: "lineas",
      width: 150,
      onHeaderCell: headerCell,
      render: (lineas: string | null) => <LineasBadges lineas={splitLineas(lineas)} />
    },
    {
      title: "Estado",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      sorter: (a, b) => Number(a.is_active) - Number(b.is_active),
      onHeaderCell: headerCell,
      render: (isActive: 1 | 0) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${
            isActive === 1 ? "bg-[#E8F9E8] text-[#1A7A1A]" : "bg-[#F0F0F0] text-[#999999]"
          }`}
        >
          {isActive === 1 ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, c) => <GenericEyeButton href={`/market-admin/clientes/${c.client_id}`} />
    }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Clientes</h1>

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
              disabled={selectedRowKeys.length === 0 || isRunningAccion}
              onClick={() =>
                selectedRowKeys.length > 0 && !isRunningAccion && setShowAcciones((v) => !v)
              }
            />
            {showAcciones && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-30 w-48 py-1">
                <button
                  onClick={() => runAccionEstado("activate")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Activar
                </button>
                <button
                  onClick={() => runAccionEstado("inactivate")}
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
          dataSource={clientes}
          rowKey="client_id"
          loading={isLoading || isRunningAccion}
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron clientes." }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          onRow={(record) => ({
            onClick: (e) => {
              // The selection checkbox handles its own toggle — don't double-toggle
              if ((e.target as HTMLElement).closest(".ant-table-selection-column")) return;
              setSelectedRowKeys((prev) =>
                prev.includes(record.client_id)
                  ? prev.filter((k) => k !== record.client_id)
                  : [...prev, record.client_id]
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
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} clientes · ${activos} activos`
          }}
          onChange={(pag, _filters, _sorter, extra) => {
            if (extra.action === "paginate") setPage(pag.current ?? 1);
          }}
        />
      </div>
    </div>
  );
}
