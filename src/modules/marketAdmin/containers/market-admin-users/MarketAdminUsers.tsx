"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "use-intl";
import GenericEyeButton from "@/components/ui/generic-eye-button";
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
import FilterUsersModal, {
  IMarketAdminUsersFilter
} from "@/modules/marketAdmin/components/market-admin-users/FilterUsersModal";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { inviteUser } from "@/services/users/users";
import { ApiError } from "@/utils/api/api";
import { IMarketAdminUser } from "@/types/marketAdmin/IMarketAdmin";
import { ROL_STYLES } from "@/modules/marketAdmin/mocks/users";
import Header from "@/components/organisms/header";

const PAGE_SIZE = 20;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function MarketAdminUsers() {
  const t = useTranslations("marketAdmin.users");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IMarketAdminUsersFilter>({
    roleId: null,
    status: null
  });
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAcciones, setShowAcciones] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const {
    data: usuarios,
    pagination,
    isLoading,
    mutate
  } = useMarketAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    role_id: filter.roleId ?? undefined,
    status: filter.status ?? undefined
  });

  function handleFilterChange(next: IMarketAdminUsersFilter) {
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
      showMessage("success", t("feedback.created"));
      setShowCreate(false);
      mutate();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("feedback.createError");
      if (error instanceof ApiError && error.status === 409) {
        showMessage("error", t("feedback.emailInUse"));
      } else {
        showMessage("error", message);
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  function runAccion(accion: "activate" | "inactivate" | "changeRole" | "export") {
    setShowAcciones(false);
    const count = selectedRowKeys.length;
    setSelectedRowKeys([]);
    alert(t("bulkActions.applied", { action: t(`bulkActions.actionNames.${accion}`), count }));
  }

  const columns: ColumnsType<IMarketAdminUser> = [
    {
      title: tCommon("fields.name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: tCommon("fields.email"),
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: t("columns.role"),
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a, b) => (a.role_name ?? "").localeCompare(b.role_name ?? ""),
      onHeaderCell: headerCell,
      render: (rol: string) => (
        <span
          className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit ${ROL_STYLES[rol] ?? "bg-[#F0F0F0] text-[#666666]"}`}
        >
          {rol || "—"}
        </span>
      )
    },
    {
      title: t("columns.customers"),
      dataIndex: "clients_count",
      key: "clients_count",
      width: 100,
      sorter: (a, b) => a.clients_count - b.clients_count,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: tCommon("fields.status"),
      dataIndex: "is_active",
      key: "is_active",
      width: 110,
      sorter: (a, b) => Number(a.is_active) - Number(b.is_active),
      onHeaderCell: headerCell,
      render: (isActive: 1 | 0) => (
        <span
          className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit ${
            isActive === 1 ? "bg-[#E8F9E8] text-[#1A7A1A]" : "bg-[#F0F0F0] text-[#999999]"
          }`}
        >
          {isActive === 1 ? tCommon("status.active") : tCommon("status.inactive")}
        </span>
      )
    },
    {
      title: t("columns.biller"),
      dataIndex: "biller_name",
      key: "biller_name",
      onHeaderCell: headerCell,
      render: (v: string | null) => <span className="text-sm text-[#141414]">{v ?? ""}</span>
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, u) => <GenericEyeButton href={`/market-admin/users/${u.id}`} />
    }
  ];

  return (
    <div className="cp-page min-h-full">
      <Header title={t("title")} back="/market-admin" />

      <div className="cp-card cp-list-card overflow-hidden px-[18px] py-[14px] [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <UiSearchInput
            placeholder={t("searchPlaceholder")}
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
                  onClick={() => runAccion("activate")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  {t("bulkActions.activate")}
                </button>
                <button
                  onClick={() => runAccion("inactivate")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  {t("bulkActions.inactivate")}
                </button>
                <button
                  onClick={() => runAccion("changeRole")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  {t("bulkActions.changeRole")}
                </button>
                <div className="h-px bg-[#EEEEEE] my-1" />
                <button
                  onClick={() => runAccion("export")}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5] transition-colors"
                >
                  {t("bulkActions.exportSelection")}
                </button>
              </div>
            )}
          </div>
          <FilterUsersModal value={filter} onChange={handleFilterChange} />

          {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
          <div className="h-[var(--control-h)] flex-shrink-0 ml-auto">
            <PrincipalButton
              onClick={() => setShowCreate(true)}
              icon={<Plus size={18} />}
              customStyles={{ fontSize: 14 }}
            >
              {t("create")}
            </PrincipalButton>
          </div>
        </div>

        <Table
          className="cp-list-scroll"
          columns={columns}
          dataSource={usuarios}
          rowKey="id"
          loading={isLoading}
          showSorterTooltip={false}
          locale={{ emptyText: t("empty") }}
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
              t("total", { from: range[0], to: range[1], total, active: activos })
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
