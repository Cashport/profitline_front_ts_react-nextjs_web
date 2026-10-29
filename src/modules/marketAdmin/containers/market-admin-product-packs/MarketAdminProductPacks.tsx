"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dropdown, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronLeft, MoreHorizontal, Package, Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useProductPacks } from "@/modules/marketAdmin/hooks/useProductPacks";
import { useMarketAdminProductLines } from "@/modules/marketAdmin/hooks/useMarketAdminProductLines";
import { useMarketAdminProductCategories } from "@/modules/marketAdmin/hooks/useMarketAdminProductCategories";
import ProductPackFormModal from "@/modules/marketAdmin/components/market-admin-product-packs/ProductPackFormModal";
import { changeProductPackState, deleteProductPack } from "@/services/productPack/productPack";
import { IProductPack } from "@/types/productPack/IProductPack";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { label: string; value: 0 | 1 | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Activos", value: 1 },
  { label: "Inactivos", value: 0 }
];

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600, fontSize: 12 } });

export default function MarketAdminProductPacks() {
  const { showMessage } = useMessageApi();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<0 | 1 | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<IProductPack | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, pagination, isLoading, mutate } = useProductPacks({
    page,
    search: debouncedSearch,
    status
  });
  const { data: lines } = useMarketAdminProductLines();
  const { data: categories } = useMarketAdminProductCategories();

  const lineName = useMemo(() => new Map(lines.map((l) => [l.id, l.description])), [lines]);
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.description])),
    [categories]
  );

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleToggleState = async (pack: IProductPack) => {
    const next = pack.is_available === 1 ? 0 : 1;
    setBusyId(pack.id);
    try {
      await changeProductPackState(pack.id, next);
      await mutate();
      showMessage("success", next === 1 ? "Pack activado." : "Pack inactivado.");
    } catch {
      showMessage("error", "No se pudo cambiar el estado del pack.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await deleteProductPack(toDelete.id);
      if (data.length === 1 && page > 1) setPage(page - 1);
      await mutate();
      showMessage("success", "Pack eliminado.");
      setToDelete(null);
    } catch {
      showMessage("error", "No se pudo eliminar el pack.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: ColumnsType<IProductPack> = [
    {
      title: "Pack",
      key: "pack",
      onHeaderCell: headerCell,
      render: (_, pack) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7f7f7]">
            {pack.image && pack.image !== "." ? (
              <img
                src={pack.image}
                alt={pack.description}
                className="h-full w-full object-contain"
              />
            ) : (
              <Package size={16} className="text-[#8a8a8a]" />
            )}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => openEdit(pack.id)}
              className="block max-w-full truncate text-left text-[12.5px] font-medium text-[#1677ff] hover:text-[#0b5bd3] hover:underline"
            >
              {pack.description}
            </button>
            <p className="truncate text-[10.5px] text-[#6b6b6b]">{pack.sku}</p>
          </div>
        </div>
      )
    },
    {
      title: "Línea",
      key: "line",
      width: 200,
      onHeaderCell: headerCell,
      render: (_, pack) => (
        <span className="text-[12.5px] text-[#141414]">{lineName.get(pack.id_line) ?? "-"}</span>
      )
    },
    {
      title: "Categoría",
      key: "category",
      width: 200,
      onHeaderCell: headerCell,
      render: (_, pack) => (
        <span className="text-[12.5px] text-[#141414]">
          {categoryName.get(pack.id_category) ?? "-"}
        </span>
      )
    },
    {
      title: "Estado",
      key: "status",
      width: 110,
      onHeaderCell: headerCell,
      render: (_, pack) => (
        <span
          className={`rounded-[5px] px-1.5 py-px text-[10.5px] font-semibold ${
            pack.is_available === 1 ? "bg-[#cbe71e] text-[#141414]" : "bg-[#f2f2f2] text-[#6b6b6b]"
          }`}
        >
          {pack.is_available === 1 ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      title: "",
      key: "actions",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, pack) => (
        <Dropdown
          trigger={["click"]}
          disabled={busyId === pack.id}
          menu={{
            items: [
              { key: "edit", label: "Editar" },
              { key: "state", label: pack.is_available === 1 ? "Inactivar" : "Activar" },
              { type: "divider" },
              { key: "delete", label: <span className="text-[#e5262b]">Eliminar</span> }
            ],
            onClick: ({ key }) => {
              if (key === "edit") openEdit(pack.id);
              if (key === "state") handleToggleState(pack);
              if (key === "delete") setToDelete(pack);
            }
          }}
        >
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4a4a4a] hover:bg-[#f2f2f2] hover:text-[#141414]"
            aria-label="Acciones"
          >
            <MoreHorizontal size={16} />
          </button>
        </Dropdown>
      )
    }
  ];

  return (
    <div className="flex min-h-screen flex-col gap-3">
      <div className="flex h-[58px] items-center gap-3">
        <Link
          href="/market-admin"
          className="flex h-8 w-8 items-center justify-center text-[#141414]"
          aria-label="Volver"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#141414]">Packs de productos</h1>
        <div className="flex-1" />
        <button
          onClick={openCreate}
          className="flex h-9 items-center gap-1.5 rounded-[10px] bg-[#cbe71e] px-4 text-[13px] font-semibold text-[#141414] transition-colors hover:bg-[#9bb514]"
        >
          <Plus size={16} strokeWidth={2.2} /> Nuevo pack
        </button>
      </div>

      <div className="rounded-[14px] bg-white px-[18px] py-[14px] [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[18px] font-semibold text-[#141414]">Packs</p>
          <div className="flex rounded-lg bg-[#f7f7f7] p-0.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={`h-8 rounded-md px-3 text-[12.5px] transition-colors ${
                  status === option.value
                    ? "bg-white font-semibold text-[#141414] shadow-sm"
                    : "text-[#6b6b6b] hover:text-[#141414]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <span className="text-[11px] text-[#8a8a8a]">
            {pagination.totalRows} {pagination.totalRows === 1 ? "pack" : "packs"}
          </span>
          <UiSearchInput
            placeholder="Buscar SKU o nombre…"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading}
          size="middle"
          locale={{
            emptyText: (
              <div className="flex flex-col items-center gap-2 py-8">
                <Package size={28} className="text-[#8a8a8a]" strokeWidth={1.7} />
                <p className="text-[12.5px] text-[#6b6b6b]">Aún no hay packs en este proyecto.</p>
                <button
                  onClick={openCreate}
                  className="text-[12.5px] font-semibold text-[#141414] underline-offset-2 hover:underline"
                >
                  Crear el primero
                </button>
              </div>
            )
          }}
          pagination={{
            current: page,
            pageSize: pagination.rowsperpage || PAGE_SIZE,
            total: pagination.totalRows,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) => `Mostrando ${range[0]}–${range[1]} de ${total} packs`
          }}
          onChange={(pag, _filters, _sorter, extra) => {
            if (extra.action === "paginate") setPage(pag.current ?? 1);
          }}
        />
      </div>

      <ProductPackFormModal
        open={formOpen}
        packId={editingId}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ModalConfirmAction
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        onOk={handleDelete}
        okLoading={busyId === toDelete?.id}
        okText="Eliminar"
        title="¿Eliminar este pack?"
        content={
          <p className="text-[13px] text-[#4a4a4a]">
            {toDelete?.description} ({toDelete?.sku}) dejará de estar disponible en el marketplace.
          </p>
        }
      />
    </div>
  );
}
