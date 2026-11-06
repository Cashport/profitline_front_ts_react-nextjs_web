import { Table, TableProps } from "antd";
import { Eye } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { PERIODICITY_LABEL } from "../../utils/periodicity";
import { IClientData, IClientDataArchive } from "@/types/dataQuality/IDataQuality";
import { TIER_CODES, TIER_META, TierBadge, TierFilterCode, useTierFilter } from "../../tiers";

/** Soft status tags, same look as the archive statuses inside the client detail. */
const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Pendiente: { color: "#B45309", bg: "#FEF3C7" },
  Completo: { color: "#047857", bg: "#D1FAE5" },
  Novedad: { color: "#B91C1C", bg: "#FEE2E2" }
};
const NEUTRAL_STATUS = { color: "#4a4a4a", bg: "#f2f2f2" };

const tierRank = (record: IClientData) => {
  const index = record.tier ? TIER_CODES.indexOf(record.tier.code) : -1;
  return index === -1 ? TIER_CODES.length : index;
};

const TIER_FILTERS = [...TIER_CODES, "NONE" as const].map((code) => ({
  text: TIER_META[code].label,
  value: code
}));

interface CountriesClientsTableProps {
  data: IClientData[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange: (page: number, pageSize: number) => void;
  scrollHeight: number;
  onRowClick?: (record: IClientData) => void;
}

export default function CountriesClientsTable({
  data,
  loading,
  pagination,
  onPaginationChange,
  scrollHeight,
  onRowClick
}: CountriesClientsTableProps) {
  // The tier column filter is the same shared filter as the legend above the table.
  const selectedTiers = useTierFilter((s) => s.selected);
  const setSelectedTiers = useTierFilter((s) => s.setSelected);

  const columns: TableProps<IClientData>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      render: (name: string) => (
        <span className="block truncate text-[13px] font-medium text-[#1677ff] hover:text-[#0b5bd3] hover:underline">
          {name}
        </span>
      ),
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      title: "Tier",
      key: "tier",
      dataIndex: "tier",
      width: 110,
      render: (_, record: IClientData) =>
        record.tier ? (
          <TierBadge tier={record.tier} />
        ) : (
          <span className="text-[13px] text-[#8a8a8a]">-</span>
        ),
      sorter: (a, b) => tierRank(a) - tierRank(b),
      filters: TIER_FILTERS,
      filteredValue: selectedTiers.length ? selectedTiers : null,
      showSorterTooltip: false
    },
    {
      title: "Periodicidad",
      key: "periodicity",
      dataIndex: "periodicity",
      render: (periodicity: string | null) => (
        <span className="text-[13px] text-[#141414]">
          {periodicity ? PERIODICITY_LABEL[periodicity] ?? periodicity : "-"}
        </span>
      ),
      ellipsis: true
    },
    {
      title: "Archivos",
      dataIndex: "client_data_archives",
      key: "archives",
      render: (archives: IClientDataArchive[]) => {
        if (!archives || archives.length === 0) {
          return <span className="text-[13px] text-gray-500">Sin archivos</span>;
        }
        return (
          <div className="flex gap-1">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className="w-[21px] h-[21px] rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                style={{ backgroundColor: archive.color }}
                title={archive.description}
              >
                {archive.abreviation}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: "Actualización",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt: string | null) => {
        if (!updatedAt) return <span className="text-[13px]">-</span>;

        const date = new Date(updatedAt);
        const formattedDate = date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });

        return <span className="text-[13px] text-[#141414]">{formattedDate}</span>;
      },
      sorter: (a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateA - dateB;
      },
      showSorterTooltip: false
    },
    {
      title: "Pendientes",
      dataIndex: "alerts",
      key: "alerts",
      align: "right",
      width: 110,
      render: (alerts: number) => {
        const count = alerts ?? 0;
        return count > 0 ? (
          <span
            title={`${count} archivos pendientes`}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold tabular-nums text-[#e5262b]"
          >
            <span className="h-[7px] w-[7px] rounded-full bg-[#e5262b]" />
            {count}
          </span>
        ) : (
          <span className="text-[13px] text-[#8a8a8a]">-</span>
        );
      },
      sorter: (a, b) => (a.alerts ?? 0) - (b.alerts ?? 0),
      showSorterTooltip: false
    },
    {
      title: "Estado",
      key: "status",
      dataIndex: "status",
      width: 150,
      render: (status: string | null) => (
        <Badge
          variant="outline"
          className="text-[13px]"
          style={{
            color: ((status && STATUS_STYLE[status]) || NEUTRAL_STATUS).color,
            backgroundColor: ((status && STATUS_STYLE[status]) || NEUTRAL_STATUS).bg,
            borderColor: "transparent"
          }}
        >
          {status || "Desconocido"}
        </Badge>
      )
    },
    {
      title: "Ver",
      key: "actions",
      width: 46,
      align: "right",
      onHeaderCell: () => ({ style: { paddingLeft: 0 } }),
      onCell: () => ({ style: { paddingLeft: 0 } }),
      render: (_, record: IClientData) => (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6b6b6b] transition-colors hover:bg-[#f2f2f2] hover:text-[#141414]"
          title="Ver detalles del cliente"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(record);
          }}
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="dq-clients-table">
      <style>{`.dq-clients-table .ant-table-pagination.ant-pagination { margin-bottom: 0 !important; margin-block-end: 0 !important; }`}</style>
      <Table<IClientData>
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.id }))}
        loading={loading}
        size="small"
        onChange={(_, filters, __, extra) => {
          if (extra.action === "filter") {
            setSelectedTiers(((filters.tier as TierFilterCode[] | null) ?? []).slice());
          }
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: onPaginationChange,
          showSizeChanger: false,
          position: ["bottomRight"],
          showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} clientes`
        }}
        scroll={{ y: scrollHeight, x: 100 }}
        onRow={(record) => ({
          onClick: () => {
            if (onRowClick) {
              onRowClick(record);
            }
          },
          className: "cursor-pointer hover:bg-gray-50"
        })}
      />
    </div>
  );
}
