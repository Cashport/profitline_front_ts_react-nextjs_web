"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, ChevronLeft, Plus } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import ModalCrearUsuario, {
  CrearUsuarioFormValues
} from "@/modules/marketAdmin/components/market-admin-users/ModalCrearUsuario";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMarketAdminUsers } from "@/modules/marketAdmin/hooks/useMarketAdminUsers";
import { useMarketAdminRoles } from "@/modules/marketAdmin/hooks/useMarketAdminRoles";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { inviteUser } from "@/services/users/users";
import { ApiError } from "@/utils/api/api";
import { IMarketAdminUser } from "@/types/marketAdmin/IMarketAdmin";
import { ROL_STYLES } from "@/modules/marketAdmin/mocks/users";

const PAGE_SIZE = 10;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function MarketAdminUsers() {
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const { data: roles } = useMarketAdminRoles();

  const {
    data: usuarios,
    pagination,
    isLoading,
    mutate
  } = useMarketAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    role_id: rolFilter === "" ? undefined : Number(rolFilter),
    status: estadoFilter === "Todos" ? undefined : estadoFilter === "Activo" ? 1 : 0
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accionesRef.current && !accionesRef.current.contains(e.target as Node))
        setShowAcciones(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activos = usuarios.filter((u) => u.is_active === 1).length;

  const handleCreateUser = async (values: CrearUsuarioFormValues) => {
    setIsCreatingUser(true);
    try {
      await inviteUser(
        {
          info: {
            name: values.name,
            cargo: values.position,
            email: values.email,
            phone: values.phone,
            rol: values.role_id ? { value: values.role_id, label: values.role_name } : undefined
          }
        },
        ID
      );
      showMessage("success", "El usuario fue creado exitosamente.");
      setShowCreate(false);
      mutate();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Oops ocurrió un error creando el usuario.";
      if (error instanceof ApiError && error.status === 409) {
        showMessage("error", "Este email ya está en uso, prueba otro.");
      } else {
        showMessage("error", message);
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  function runAccion(accion: string) {
    setShowAcciones(false);
    const count = selectedRowKeys.length;
    setSelectedRowKeys([]);
    alert(`Acción "${accion}" aplicada a ${count} usuario(s).`);
  }

  const columns: ColumnsType<IMarketAdminUser> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Rol",
      dataIndex: "role_name",
      key: "role_name",
      width: 130,
      sorter: (a, b) => (a.role_name ?? "").localeCompare(b.role_name ?? ""),
      onHeaderCell: headerCell,
      render: (rol: string) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ROL_STYLES[rol] ?? "bg-[#F0F0F0] text-[#666666]"}`}
        >
          {rol || "—"}
        </span>
      )
    },
    {
      title: "Clientes",
      dataIndex: "clients_count",
      key: "clients_count",
      width: 100,
      sorter: (a, b) => a.clients_count - b.clients_count,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "is_active",
      key: "is_active",
      width: 110,
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
      render: (_, u) => (
        <Link
          href={`/market-admin/usuarios/${u.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-8 h-8 ml-auto rounded-md bg-[#F7F7F7] text-[#141414] border border-transparent hover:border-[#141414] transition-colors"
        >
          <Eye size={19} />
        </Link>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Usuarios</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden p-8 [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
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
                <button
                  onClick={() => runAccion("Cambiar rol")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  Cambiar rol
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
            value={rolFilter}
            onChange={(e) => {
              setRolFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#555555] outline-none focus:border-[#141414] transition-colors"
          >
            <option value="">Rol</option>
            {roles.map((r) => (
              <option key={r.ID} value={r.ID}>
                {r.ROL_NAME}
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

          {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
          <div className="h-10 flex-shrink-0 ml-auto">
            <PrincipalButton onClick={() => setShowCreate(true)} icon={<Plus size={15} />}>
              Crear usuario
            </PrincipalButton>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={usuarios}
          rowKey="id"
          loading={isLoading}
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron usuarios." }}
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
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} usuarios · ${activos} activos`
          }}
          onChange={(pag, _filters, _sorter, extra) => {
            if (extra.action === "paginate") setPage(pag.current ?? 1);
          }}
        />
      </div>

      <ModalCrearUsuario
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSend={handleCreateUser}
        isLoading={isCreatingUser}
      />
    </div>
  );
}
