import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import { Table, TableProps } from "antd";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IClientData, IClientDataArchive } from "@/types/dataQuality/IDataQuality";

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

const getStatusBadge = (status: string) => {
  // Since API doesn't provide status yet, show "desconocido" with outline variant
  return (
    <Badge variant="outline" className="text-xs">
      desconocido
    </Badge>
  );
};

const getFileTypeBadges = (archives: IClientDataArchive[]) => {
  const fileTypes: Array<{ type: string; label: string; color: string }> = [];

  archives.forEach((archive) => {
    if (!archive?.description || !archive?.id || !archive?.periodicity) return;
    const desc = archive?.description?.toLowerCase();
    if (!desc) return;
    if (desc.includes("stock") || desc.includes("inventario")) {
      if (!fileTypes.some((f) => f.type === "stock")) {
        fileTypes.push({ type: "stock", label: "ST", color: "bg-blue-500" });
      }
    }
    if (desc.includes("sales") || desc.includes("ventas") || desc.includes("venta")) {
      if (!fileTypes.some((f) => f.type === "sales")) {
        fileTypes.push({ type: "sales", label: "SA", color: "bg-green-500" });
      }
    }
    if (desc.includes("transit") || desc.includes("tránsito") || desc.includes("transito")) {
      if (!fileTypes.some((f) => f.type === "transit")) {
        fileTypes.push({ type: "transit", label: "IT", color: "bg-purple-500" });
      }
    }
    if (desc.includes("store")) {
      if (!fileTypes.some((f) => f.type === "store")) {
        fileTypes.push({ type: "store", label: "ST", color: "bg-yellow-500" });
      }
    }
  });

  // If no types detected, show generic badge for each archive
  if (fileTypes.length === 0 && archives.length > 0) {
    return archives.map((archive, idx) => ({
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
      render: (name: string, record: IClientData) => (
        <p className="font-medium hover:underline text-[#141414]">{name}</p>
      ),
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      title: "Periodicidad",
      key: "periodicity",
      render: () => <span className="text-gray-500">-</span>
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
      render: (_, record: IClientData) => getStatusBadge("unknown")
    },
    {
      title: "Ver",
      key: "actions",
      width: 60,
      align: "right",
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
  );
}
