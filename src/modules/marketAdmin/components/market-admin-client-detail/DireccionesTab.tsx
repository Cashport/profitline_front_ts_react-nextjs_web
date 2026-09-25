"use client";

import { useState } from "react";
import { Table, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ModalDireccion from "@/modules/marketAdmin/components/market-admin-client-detail/ModalDireccion";
import {
  ICreateMarketAdminClientAddressBody,
  IMarketAdminClientAddress
} from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  direcciones: IMarketAdminClientAddress[];
  isLoading?: boolean;
  onAdd: (values: ICreateMarketAdminClientAddressBody) => Promise<void>;
  onUpdate: (id: number, values: ICreateMarketAdminClientAddressBody) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

type ModalState = { mode: "new" } | { mode: "edit"; direccion: IMarketAdminClientAddress } | null;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function DireccionesTab({
  direcciones,
  isLoading,
  onAdd,
  onUpdate,
  onDelete
}: Props) {
  const [modal, setModal] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch {
      // El contenedor ya muestra el mensaje de error.
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<IMarketAdminClientAddress> = [
    {
      title: "Dirección",
      dataIndex: "address",
      key: "address",
      onHeaderCell: headerCell,
      render: (v: string, d) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#141414]">{v}</span>
          {d.is_principal === 1 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0F7E1] text-[#5A7A00]">
              Principal
            </span>
          )}
        </div>
      )
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v || "—"}</span>
    },
    {
      title: "Bodega",
      key: "bodega",
      onHeaderCell: headerCell,
      render: (_, d) => (
        <span className="text-sm text-[#141414]">
          {[d.warehouse_code, d.warehouse_description].filter(Boolean).join(" — ") || "—"}
        </span>
      )
    },
    {
      title: "",
      key: "acciones",
      width: 88,
      onHeaderCell: headerCell,
      render: (_, d) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModal({ mode: "edit", direccion: d })}
            className="w-7 h-7 rounded-lg text-[#AAAAAA] hover:text-[#141414] hover:bg-[#F0F0F0] flex items-center justify-center transition-colors"
          >
            <Pencil size={13} />
          </button>
          <Popconfirm
            title="Eliminar dirección"
            description={`¿Eliminar "${d.address}"?`}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: deletingId === d.id }}
            placement="topRight"
            onConfirm={() => handleDelete(d.id)}
          >
            <button className="w-7 h-7 rounded-lg text-[#AAAAAA] hover:text-[#E53E3E] hover:bg-[#FFF5F5] flex items-center justify-center transition-colors">
              <Trash2 size={13} />
            </button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#666666]">
          {direcciones.length} {direcciones.length === 1 ? "dirección" : "direcciones"} registradas
        </p>
        <button
          onClick={() => setModal({ mode: "new" })}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
        >
          <Plus size={14} /> Nueva dirección
        </button>
      </div>

      <Table
        columns={columns}
        dataSource={direcciones}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: "No hay direcciones registradas." }}
      />

      {modal && (
        <ModalDireccion
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.direccion : undefined}
          onClose={() => setModal(null)}
          onSave={async (values) => {
            if (modal.mode === "new") await onAdd(values);
            else await onUpdate(modal.direccion.id, values);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
