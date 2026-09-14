"use client";

import { useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import UiSearchInput from "@/components/ui/search-input";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMarketAdminClients } from "@/modules/marketAdmin/hooks/useMarketAdminClients";
import { IMarketAdminClient } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  asignadosNits: Set<string>;
  onAgregar: (nits: string[]) => Promise<boolean>;
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
  const [selectedNits, setSelectedNits] = useState<string[]>([]);
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

  // La tabla es paginada en el servidor: solo se reconcilian las filas visibles
  // para que la selección de otras páginas no se pierda al paginar o buscar.
  const visibleSelectedNits = useMemo(
    () => disponibles.filter((c) => selectedNits.includes(c.client_id)).map((c) => c.client_id),
    [disponibles, selectedNits]
  );

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    const nextVisible = newSelectedRowKeys.map(String);
    const visibleNits = new Set(disponibles.map((c) => c.client_id));
    setSelectedNits((prev) => [
      ...prev.filter((nit) => !visibleNits.has(nit)),
      ...nextVisible.filter((nit) => visibleNits.has(nit))
    ]);
  };

  const handleAgregar = async () => {
    const ok = await onAgregar(selectedNits);
    if (ok) onClose();
  };

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
          id="modal-agregar-clientes-search"
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
        rowSelection={{
          columnWidth: 40,
          selectedRowKeys: visibleSelectedNits,
          onChange: onSelectChange
        }}
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

      {selectedNits.length > 0 && (
        <p className="mt-3 text-sm text-[#666666]">
          {selectedNits.length === 1
            ? "1 cliente seleccionado"
            : `${selectedNits.length} clientes seleccionados`}
        </p>
      )}

      <div className="mt-6">
        <FooterButtons
          titleCancel="Cancelar"
          titleConfirm="Agregar seleccionados"
          onClose={onClose}
          handleOk={handleAgregar}
          isConfirmDisabled={selectedNits.length === 0}
          isConfirmLoading={disabled}
        />
      </div>
    </Modal>
  );
}
