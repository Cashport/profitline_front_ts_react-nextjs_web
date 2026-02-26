"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { usePointsOfSale } from "../../hooks/usePointsOfSale";
import { IPOS } from "@/types/dataQuality/IDataQuality";
import UiSearchInput from "@/components/ui/search-input";
import { Plus } from "@phosphor-icons/react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { ModalAddEditPOS } from "../ModalAddEditPOS";

const MOCK_POS: IPOS[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  pos_id: `POS-${String(i + 1).padStart(3, "0")}`,
  pos_name: `Point of Sale ${i + 1}`,
  channel: ["Retail", "Wholesale", "Online"][i % 3],
  sub_channel: ["Direct", "Distributor", "Agent"][i % 3],
  city: 1000 + i,
  pos_internal_sales_representative: `Rep ${i + 1}`,
  // unused fields
  region: "",
  country_name: "",
  id_client: 0,
  ship_to: "",
  customer_name: "",
  pos_tax_code: "",
  pos_chain_name: "",
  pos_format_store: "",
  pos_active: true,
  pos_internal_zone: "",
  pos_external_zone: "",
  department: 0,
  pos_neighborhood: "",
  pos_address: "",
  pos_geolongitud: 0,
  pos_geolatitud: 0,
  pos_supervisor: "",
  pos_external_sales_representative: "",
  pos_cod_sfe: ""
}));

const columns: ColumnsType<IPOS> = [
  {
    title: "POS ID",
    dataIndex: "pos_id",
    key: "pos_id",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "POS Name",
    dataIndex: "pos_name",
    key: "pos_name",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "Channel",
    dataIndex: "channel",
    key: "channel",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "Sub Channel",
    dataIndex: "sub_channel",
    key: "sub_channel",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "Internal Sales Representation",
    dataIndex: "pos_internal_sales_representative",
    key: "pos_internal_sales_representative",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
  },
  {
    title: "Acciones",
    key: "acciones",
    align: "right",
    onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } }),
    render: () => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }
];

export function PointsOfSaleTable() {
  const params = useParams();
  const clientId = params.clientId as string;
  const countryId = params.countryId as string;

  const { isLoading, mutate } = usePointsOfSale(clientId, countryId);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPOS = MOCK_POS.filter((pos) => {
    const term = search.toLowerCase();
    return (
      pos.pos_id?.toLowerCase().includes(term) ||
      pos.pos_name?.toLowerCase().includes(term) ||
      pos.channel?.toLowerCase().includes(term) ||
      pos.sub_channel?.toLowerCase().includes(term) ||
      pos.pos_internal_sales_representative?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />

        <Button
          className="text-sm font-medium"
          style={{
            backgroundColor: "#CBE71E",
            color: "#141414",
            border: "none"
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo POS
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredPOS}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 7 }}
        size="small"
      />

      <ModalAddEditPOS
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={Number(clientId)}
        countryId={Number(countryId)}
        onSuccess={mutate}
      />
    </div>
  );
}
