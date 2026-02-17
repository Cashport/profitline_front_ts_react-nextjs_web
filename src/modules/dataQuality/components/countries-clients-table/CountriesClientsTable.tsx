import { Calendar, Eye } from "lucide-react";
import { Table, TableProps } from "antd";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IClientData, IClientDataArchive } from "@/types/dataQuality/IDataQuality";
import { FILE_TYPE_MAPPINGS } from "@/modules/dataQuality/lib/constants";

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

const getFileTypeBadges = (archives: IClientDataArchive[]) => {
  const fileTypes: Array<{ type: string; label: string; color: string }> = [];

  archives.forEach((archive) => {
    const desc = archive?.description?.toLowerCase();
    if (!desc) return;

    const match = FILE_TYPE_MAPPINGS.find((m) => desc.includes(m.keyword));
    if (match && !fileTypes.some((f) => f.type === match.type)) {
      fileTypes.push({ type: match.type, label: match.label, color: match.color });
    }
  });

  // If no types detected, show generic badge for each valid archive
  const validArchives = archives.filter((a) => a?.id && a?.description);
  if (fileTypes.length === 0 && validArchives.length > 0) {
    return validArchives.map((archive, idx) => ({
      type: `archive-${idx}`,
      label: "AR",
      color: "bg-gray-500"
    }));
  }

  return fileTypes;
};

export default function CountriesClientsTable({
  data,
  loading,
  pagination,
  onPaginationChange,
  scrollHeight,
  onRowClick
}: CountriesClientsTableProps) {
  const columns: TableProps<IClientData>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      render: (name: string) => (
        <p className="font-medium hover:underline text-[#141414]">{name}</p>
      ),
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      title: "Periodicidad",
      key: "periodicity",
      dataIndex: "periodicity",
      render: (periodicity) => <span className="text-gray-500">{periodicity}</span>,
      ellipsis: true
    },
    {
      title: "Archivos",
      dataIndex: "client_data_archives",
      key: "archives",
      render: (archives: IClientDataArchive[]) => {
        const fileTypes = getFileTypeBadges(archives);

        return (
          <div className="flex gap-1">
            {fileTypes.map((fileType, idx) => (
              <div
                key={`${fileType.type}-${idx}`}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${fileType.color}`}
                title={fileType.type}
              >
                {fileType.label}
              </div>
            ))}
            {fileTypes.length === 0 && <span className="text-xs text-gray-500">Sin archivos</span>}
          </div>
        );
      }
    },
    {
      title: "Actualización",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt: string | null) => {
        if (!updatedAt) return <span className="text-xs">-</span>;

        const date = new Date(updatedAt);
        const formattedDate = date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });

        return (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#141414]" />
            <span className="text-[#141414]">{formattedDate}</span>
          </div>
        );
      },
      sorter: (a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateA - dateB;
      },
      showSorterTooltip: false
    },
    {
      title: "Estado",
      key: "status",
      dataIndex: "status",
      render: (status) => (
        <Badge variant="outline" className="text-xs">
          {status || "desconocido"}
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Ver detalles del cliente"
          onClick={(e) => {
            e.stopPropagation();
            if (onRowClick) {
              onRowClick(record);
            }
          }}
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Button>
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
