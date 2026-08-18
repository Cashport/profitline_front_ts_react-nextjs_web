"use client";

import { useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMarketAdminClients } from "@/modules/marketAdmin/hooks/useMarketAdminClients";
import { IMarketAdminClient } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  asignadosNits: Set<string>;
  onAgregar: (nit: string) => void;
  onClose: () => void;
  disabled?: boolean;
};

const PAGE_SIZE = 10;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ModalAgregarClientes({
  asignadosNits,
  onAgregar,
  onClose,
  disabled
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const {
    data: clientes,
    pagination,
    isLoading
  } = useMarketAdminClients({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch
  });

  const disponibles = clientes.filter((c) => !asignadosNits.has(c.client_id));

  const columns: ColumnsType<IMarketAdminClient> = [
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "NIT",
      dataIndex: "client_id",
      key: "client_id",
      width: 160,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      width: 160,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v || "—"}</span>
    },
    {
      title: "",
      key: "agregar",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, c) => (
        <button
          title="Agregar cliente"
          disabled={disabled}
          onClick={() => onAgregar(c.client_id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCCCCC] hover:bg-[#E6F9E6] hover:text-[#1A7A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#CCCCCC]"
        >
          <Plus size={13} />
        </button>
      )
    }
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      centered
      width={832}
      title={<span className="text-base font-bold text-[#141414]">Agregar clientes</span>}
      footer={null}
    >
      <div className="mb-4">
        <UiSearchInput
          placeholder="Buscar cliente..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={disponibles}
        rowKey="client_id"
        loading={isLoading}
        scroll={{ y: 360 }}
        locale={{ emptyText: "No se encontraron clientes." }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: pagination.totalRows,
          showSizeChanger: false,
          position: ["bottomRight"],
          showTotal: (t, range) => `Mostrando ${range[0]}–${range[1]} de ${t} clientes`
        }}
        onChange={(pag, _filters, _sorter, extra) => {
          if (extra.action === "paginate") setPage(pag.current ?? 1);
        }}
      />
    </Modal>
  );
}
