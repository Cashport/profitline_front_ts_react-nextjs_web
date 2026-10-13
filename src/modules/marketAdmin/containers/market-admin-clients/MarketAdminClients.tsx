"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronLeft } from "lucide-react";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminClients } from "@/modules/marketAdmin/hooks/useMarketAdminClients";
import FilterClientsModal, {
  EMPTY_CLIENTS_FILTER,
  IMarketAdminClientsFilter
} from "@/modules/marketAdmin/components/market-admin-clients/FilterClientsModal";
import {
  downloadMarketAdminClientsConfig,
  massiveUpdateMarketAdminClientsConfig,
  updateMarketAdminClientsBatch
} from "@/services/marketAdmin/marketAdmin";
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

// Un cliente puede tener direcciones en muchas ciudades: se muestran las
// primeras tres y el resto queda en el tooltip del (+N).
const MAX_CIUDADES = 3;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

const splitLineas = (lineas: string | null) =>
  lineas
    ?.split(",")
    .map((l) => l.trim())
    .filter(Boolean) ?? [];

function Ciudades({ value }: { value: string | null }) {
  const ciudades =
    value
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean) ?? [];
  if (ciudades.length === 0) return <span className="text-sm text-[#141414]">—</span>;

  const visibles = ciudades.slice(0, MAX_CIUDADES);
  const ocultas = ciudades.slice(MAX_CIUDADES);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-sm text-[#141414]">{visibles.join(", ")}</span>
      {ocultas.length > 0 && (
        <Tooltip title={ciudades.join(", ")}>
          <span className="text-xs font-semibold text-[#999999] cursor-default">
            (+{ocultas.length})
          </span>
        </Tooltip>
      )}
    </div>
  );
}

export default function MarketAdminClients() {
  const { showMessage } = useMessageApi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IMarketAdminClientsFilter>(EMPTY_CLIENTS_FILTER);
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const [isRunningAccion, setIsRunningAccion] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

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
    status: filter.status ?? undefined,
    linea: filter.linea ?? undefined,
    asigned_user: filter.asigned_user,
    coordinator: filter.coordinator,
    kam: filter.kam,
    kam_lider: filter.kam_lider
  });

  // NIT de cada cliente cargado: la selección puede abarcar varias páginas y la
  // descarga se pide por NIT, no por client_id.
  const nitByClientId = useRef(new Map<string, string>());
  useEffect(() => {
    clientes.forEach((c) => nitByClientId.current.set(c.client_id, c.nit));
  }, [clientes]);

  function handleFilterChange(next: IMarketAdminClientsFilter) {
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

  async function handleBulkFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // El input se resetea siempre para poder volver a elegir el mismo archivo.
    e.target.value = "";
    if (!file) return;
    try {
      setIsRunningAccion(true);
      const { updated, not_found } = await massiveUpdateMarketAdminClientsConfig(file);
      // La hoja cambia Ejecutivo/Coordinador/KAM, por los que también filtra el listado.
      await mutate();
      showMessage("success", `${updated} cliente(s) actualizado(s) correctamente.`);
      if (not_found.length > 0) {
        const extra = not_found.length > 5 ? ` y ${not_found.length - 5} más` : "";
        showMessage("warning", `NIT no encontrados: ${not_found.slice(0, 5).join(", ")}${extra}.`);
      }
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Ocurrió un error al cargar el archivo."
      );
    } finally {
      setIsRunningAccion(false);
    }
  }

  async function handleExportarClientes() {
    setShowAcciones(false);
    const nits = selectedRowKeys
      .map((key) => nitByClientId.current.get(String(key)))
      .filter((nit): nit is string => !!nit);
    try {
      setIsRunningAccion(true);
      await downloadMarketAdminClientsConfig(nits);
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Ocurrió un error al exportar los clientes."
      );
    } finally {
      setIsRunningAccion(false);
    }
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
      render: (v: string) => <Ciudades value={v} />
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
      width: 140,
      sorter: (a, b) =>
        Number(a.in_marketplace) - Number(b.in_marketplace) ||
        Number(a.is_active) - Number(b.is_active),
      onHeaderCell: headerCell,
      render: (isActive: 1 | 0, c: IMarketAdminClient) =>
        c.in_marketplace === 0 ? (
          // Sin registro en client_marketplace: no hay estado que editar.
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit bg-[#F0F0F0] text-[#999999]">
            Sin marketplace
          </span>
        ) : (
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
      render: (_, c) => <GenericEyeButton href={`/market-admin/clientes/${c.nit}`} />
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
              disabled={isRunningAccion}
              onClick={() => !isRunningAccion && setShowAcciones((v) => !v)}
            />
            {showAcciones && (
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-30 w-48 py-1">
                <button
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => runAccionEstado("activate")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Activar
                </button>
                <button
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => runAccionEstado("inactivate")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Inactivar
                </button>
                <div className="h-px bg-[#EEEEEE] my-1" />
                <button
                  onClick={() => {
                    setShowAcciones(false);
                    bulkFileInputRef.current?.click();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Actualización masiva
                </button>
                <button
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleExportarClientes}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Exportar clientes
                </button>
              </div>
            )}
            {/* Fuera del menú: si se desmontara al cerrarlo, el onChange nunca llegaría. */}
            <input
              ref={bulkFileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleBulkFileSelected}
            />
          </div>
          <FilterClientsModal value={filter} onChange={handleFilterChange} />
        </div>

        <Table
          columns={columns}
          dataSource={clientes}
          rowKey="client_id"
          loading={isLoading || isRunningAccion}
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron clientes." }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            // Activar/inactivar escribe en client_marketplace: un cliente que no
            // está en esa tabla no tiene nada sobre lo que actuar.
            getCheckboxProps: (record) => ({ disabled: record.in_marketplace === 0 })
          }}
          onRow={(record) => ({
            onClick: (e) => {
              // The selection checkbox handles its own toggle — don't double-toggle
              if ((e.target as HTMLElement).closest(".ant-table-selection-column")) return;
              if (record.in_marketplace === 0) return;
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
