"use client";

import { useMemo, useState } from "react";
import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import useSWR from "swr";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import UiSearchInput from "@/components/ui/search-input";
import ProfitLoader from "@/components/ui/profit-loader";
import { getAllDiscounts } from "@/services/discount/discount.service";
import { MARKET_ADMIN_DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";
import { useAppStore } from "@/lib/store/store";
import { DiscountBasics } from "@/types/discount/DiscountBasics";
import AccionesDropdown from "./AccionesDropdown";
import DiscountsToolbar from "./DiscountsToolbar";
import {
  DateCell,
  ESTADO_FILTER_ALL,
  ESTADO_FILTER_OPTIONS,
  ESTADO_SELECT_CLASSNAME,
  PAGE_SIZE,
  StatusPill,
  TextCell,
  TypePill,
  headerCell
} from "./discountsTableConfig";

interface DiscountRulesTabProps {
  onCrearNuevo: () => void;
}

export default function DiscountRulesTab({ onCrearNuevo }: DiscountRulesTabProps) {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState(ESTADO_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: rulesData, isLoading } = useSWR(
    ID ? ["discount-rules", ID, estadoFilter] : null,
    () =>
      getAllDiscounts({
        projectId: ID,
        params: estadoFilter === ESTADO_FILTER_ALL ? undefined : { active: Number(estadoFilter) }
      })
  );

  const reglas = useMemo(() => rulesData?.data ?? [], [rulesData]);

  const filtered = useMemo(
    () =>
      reglas.filter((r) => (r.discount_name ?? "").toLowerCase().includes(search.toLowerCase())),
    [search, reglas]
  );

  const activas = filtered.filter((r) => r.status === 1).length;

  const columns: ColumnsType<DiscountBasics> = [
    {
      title: "Nombre",
      dataIndex: "discount_name",
      key: "discount_name",
      sorter: (a, b) => (a.discount_name ?? "").localeCompare(b.discount_name ?? ""),
      onHeaderCell: headerCell,
      render: (v: string) => <TextCell value={v} />
    },
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      sorter: (a, b) => (a.client_name ?? "").localeCompare(b.client_name ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <TextCell value={v} />
    },
    {
      title: "Tipo descuentos",
      dataIndex: "discount_type",
      key: "discount_type",
      width: 160,
      sorter: (a, b) => (a.discount_type ?? "").localeCompare(b.discount_type ?? ""),
      onHeaderCell: headerCell,
      render: (tipo: string) => <TypePill tipo={tipo} />
    },
    {
      title: "Definiciones",
      dataIndex: "discount_definition",
      key: "discount_definition",
      sorter: (a, b) => (a.discount_definition ?? "").localeCompare(b.discount_definition ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <TextCell value={v} />
    },
    {
      title: "Inicio",
      dataIndex: "start_date",
      key: "start_date",
      sorter: (a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""),
      onHeaderCell: headerCell,
      render: (v: string) => <DateCell value={v} />
    },
    {
      title: "Fin",
      dataIndex: "end_date",
      key: "end_date",
      sorter: (a, b) => (a.end_date ?? "").localeCompare(b.end_date ?? ""),
      onHeaderCell: headerCell,
      render: (v: string | null) => <DateCell value={v} />
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 110,
      sorter: (a, b) => a.status - b.status,
      onHeaderCell: headerCell,
      render: (status: number) => <StatusPill active={status} />
    },
    {
      title: "",
      key: "ver",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, r) => <GenericEyeButton href={`${MARKET_ADMIN_DISCOUNTS_BASE}/regla/${r.id}`} />
    }
  ];

  return (
    <>
      <DiscountsToolbar onCrearNuevo={onCrearNuevo}>
        <UiSearchInput
          placeholder="Buscar..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <AccionesDropdown
          selectedCount={selectedRowKeys.length}
          entityLabel="regla(s)"
          onClearSelection={() => setSelectedRowKeys([])}
        />
        <Select
          value={estadoFilter}
          onChange={(value) => {
            setEstadoFilter(value);
            setPage(1);
          }}
          options={ESTADO_FILTER_OPTIONS}
          placeholder="Estado"
          style={{ minWidth: 140 }}
          className={ESTADO_SELECT_CLASSNAME}
        />
      </DiscountsToolbar>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <ProfitLoader />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          showSorterTooltip={false}
          locale={{ emptyText: "No se encontraron reglas de descuento." }}
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
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) =>
              `Mostrando ${range[0]}–${range[1]} de ${total} reglas · ${activas} activas`
          }}
          onChange={(pag, _filters, _sorter, extra) =>
            setPage(extra.action === "paginate" ? pag.current ?? 1 : 1)
          }
        />
      )}
    </>
  );
}
