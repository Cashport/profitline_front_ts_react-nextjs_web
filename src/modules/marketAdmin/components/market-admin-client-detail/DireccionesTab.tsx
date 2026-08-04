"use client";

import { useState } from "react";
import { Table, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ModalDireccion from "@/modules/marketAdmin/components/market-admin-client-detail/ModalDireccion";
import { type Direccion } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  direcciones: Direccion[];
  onAdd: (values: Omit<Direccion, "id">) => void;
  onUpdate: (id: string, values: Omit<Direccion, "id">) => void;
  onDelete: (id: string) => void;
};

type ModalState = { mode: "new" } | { mode: "edit"; direccion: Direccion } | null;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function DireccionesTab({ direcciones, onAdd, onUpdate, onDelete }: Props) {
  const [modal, setModal] = useState<ModalState>(null);

  const columns: ColumnsType<Direccion> = [
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Ciudad",
      dataIndex: "ciudad",
      key: "ciudad",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Bodega",
      dataIndex: "bodega",
      key: "bodega",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
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
            description={`¿Eliminar "${d.direccion}"?`}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            placement="topRight"
            onConfirm={() => onDelete(d.id)}
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
        pagination={false}
        locale={{ emptyText: "No hay direcciones registradas." }}
      />

      {modal && (
        <ModalDireccion
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.direccion : undefined}
          onClose={() => setModal(null)}
          onSave={(values) => {
            if (modal.mode === "new") onAdd(values);
            else onUpdate(modal.direccion.id, values);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
