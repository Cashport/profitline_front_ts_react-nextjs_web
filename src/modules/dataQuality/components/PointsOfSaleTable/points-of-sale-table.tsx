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

  const { data: pointsOfSale, isLoading } = usePointsOfSale(clientId, countryId);

  const [search, setSearch] = useState("");

  const filteredPOS = (pointsOfSale ?? []).filter((pos) => {
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
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
