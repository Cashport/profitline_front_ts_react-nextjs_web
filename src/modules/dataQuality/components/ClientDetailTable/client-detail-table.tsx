import { useState } from "react";
import dayjs from "dayjs";
import { Calendar, ChevronDown, Filter, MoreHorizontal } from "lucide-react";
import { Dropdown, message } from "antd";

import {
  deleteIntakeFile,
  downloadCSV,
  downloadExcel,
  uploadIntakeFile
} from "@/services/dataQuality/dataQuality";
import { useArchivesClientData } from "../../hooks/useArchivesClientData";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import { IClientDetailArchiveClient } from "@/types/dataQuality/IDataQuality";

interface IClientDetailTableProps {
  clientId: string;
  clientName?: string | null;
  mutateDetail?: () => void;
}

const bytesToMB = (bytes: number): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (isoDateString: string): string => {
  return dayjs(isoDateString).format("YYYY-MM-DD");
};

export function ClientDetailTable({ clientId, clientName, mutateDetail }: IClientDetailTableProps) {
  const [isUploadingLoading, setIsUploadingLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });

  const { archives: files, mutate } = useArchivesClientData(
    clientId,
    dateRange.start,
    dateRange.end
  );

  const handleUploadIntake = async (id: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploadingLoading(true);
        const hide = message.open({
          type: "loading",
          content: "Subiendo archivo de ingesta...",
          duration: 0
        });
        try {
          await uploadIntakeFile(id, file);
          message.success("Archivo de ingesta subido exitosamente.");
          mutateDetail && mutateDetail();
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : "Error al subir el archivo de ingesta. Por favor, inténtalo de nuevo."
          );
        } finally {
          hide();
          setIsUploadingLoading(false);
        }
      }
      input.remove();
    };
    input.click();
  };

  const handleProcessedFile = async (file: IClientDetailArchiveClient, type: "excel" | "csv") => {
    const hide = message.open({ type: "loading", content: "Descargando archivo...", duration: 0 });
    const fileName = `${file.data_type.description}_${clientName}_${file.date_archive ? formatDate(file.date_archive) : ""}`;
    try {
      const res = type === "excel" ? await downloadExcel(file.id) : await downloadCSV(file.id);
      const link = document.createElement("a");

      if (res instanceof Blob) {
        const url = window.URL.createObjectURL(res);
        link.href = url;
        link.setAttribute("download", fileName);
      } else {
        const response = await fetch(res.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        const fileExtension = res.filename.split(".").pop() || "xlsx";
        link.setAttribute("download", `${fileName}.${fileExtension}`);
      }

      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Archivo descargado exitosamente.");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al descargar el archivo. Por favor, inténtalo de nuevo.";
      message.error(errorMessage);
    } finally {
      hide();
    }
  };

  const handleDownloadOriginal = async (file: IClientDetailArchiveClient) => {
    if (!file.procesed_url) {
      message.error("No hay URL disponible para descargar el archivo original.");
      return;
    }
    const hide = message.open({
      type: "loading",
      content: "Descargando archivo original...",
      duration: 0
    });
    try {
      const response = await fetch(file.procesed_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.description || "archivo_original");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al descargar el archivo. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    setIsDeleteLoading(true);
    try {
      await deleteIntakeFile(fileId);
      message.success("Archivo eliminado exitosamente.");
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el archivo. Por favor, inténtalo de nuevo."
      );
    }
    setIsDeleteLoading(false);
  };

  const filterMenu = (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 p-4">
      <DateRangeFilter
        dateRange={dateRange}
        onDateRangeChange={(start, end) => setDateRange({ start, end })}
        onClear={() => setDateRange({ start: null, end: null })}
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
          Archivos
        </h2>
        <Dropdown dropdownRender={() => filterMenu} trigger={["click"]} placement="bottomRight">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </Dropdown>
      </div>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha cargue</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tamaño</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Estado</TableHead>
            <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files?.map((file) => (
            <TableRow key={file.id} className="hover:bg-gray-50" style={{ borderColor: "#DDDDDD" }}>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="text-xs text-white"
                  style={{ backgroundColor: file.data_type.color }}
                >
                  {file.data_type.description}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                  <span style={{ color: "#141414" }}>
                    {file.date_archive ? formatDate(file.date_archive) : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <span className="font-normal" style={{ color: "#141414" }}>
                    {file.description}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                  <span style={{ color: "#141414" }}>
                    {file.date_upload ? formatDate(file.date_upload) : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>{bytesToMB(file.size)}</span>
              </TableCell>
              <TableCell>
                {file.last_novelty ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        {file.status_description}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-cashport-black text-white">
                      <p className="text-xs">{file.last_novelty}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {file.status_description}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="w-0">
                <div className="flex items-center justify-center">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "upload",
                          label: "Subir ingesta",
                          onClick: () => handleUploadIntake(file.id),
                          disabled: isUploadingLoading
                        },
                        {
                          key: "download-original",
                          label: "Descarga original",
                          onClick: () => handleDownloadOriginal(file)
                        },
                        {
                          key: "download-universal",
                          label: "Descarga universal",
                          onClick: () => handleProcessedFile(file, "csv")
                        },
                        {
                          key: "download-universal-excel",
                          label: "Descarga universal excel",
                          onClick: () => handleProcessedFile(file, "excel")
                        },
                        {
                          key: "delete",
                          label: "Eliminar archivo",
                          onClick: () => handleDeleteFile(file.id),
                          disabled: isDeleteLoading
                        }
                      ]
                    }}
                    trigger={["click"]}
                  >
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
