import { useState } from "react";
import dayjs from "dayjs";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Dropdown, Spin, message } from "antd";

import { uploadAuxiliaryFile } from "@/services/dataQuality/dataQuality";
import { useAuxiliaryFiles } from "../../hooks/useAuxiliaryFiles";

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
import { IAuxiliaryFile } from "@/types/dataQuality/IDataQuality";

const bytesToMB = (bytes: number | null): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (isoDateString: string | null): string => {
  return isoDateString ? dayjs(isoDateString).format("YYYY-MM-DD") : "-";
};

export function AuxiliaryFilesTable() {
  const { auxiliaryFiles, isLoading, isValidating, mutate } = useAuxiliaryFiles();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (id: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        const hide = message.open({ type: "loading", content: "Cargando archivo...", duration: 0 });
        try {
          await uploadAuxiliaryFile(id, file);
          message.success("Archivo cargado exitosamente.");
          mutate();
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : "Error al cargar el archivo. Por favor, inténtalo de nuevo."
          );
        } finally {
          hide();
          setIsUploading(false);
        }
      }
      input.remove();
    };
    input.click();
  };

  const handleDownload = async (file: IAuxiliaryFile) => {
    if (!file.file_url) {
      message.error("No hay archivo disponible para descargar.");
      return;
    }
    const hide = message.open({ type: "loading", content: "Descargando archivo...", duration: 0 });
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.description || file.file_type);
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

  return (
    <Spin spinning={isLoading || isValidating}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha cargue</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tamaño</TableHead>
            <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && !auxiliaryFiles?.length ? (
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                No hay archivos auxiliares
              </TableCell>
            </TableRow>
          ) : (
            auxiliaryFiles?.map((file) => (
              <TableRow
                key={file.id}
                className="hover:bg-gray-50"
                style={{ borderColor: "#DDDDDD" }}
              >
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="text-xs text-white"
                    style={{ backgroundColor: file.file_type_color }}
                  >
                    {file.file_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                    <span style={{ color: "#141414" }}>{formatDate(file.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-normal" style={{ color: "#141414" }}>
                    {file.description || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                    <span style={{ color: "#141414" }}>{formatDate(file.uploaded_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{bytesToMB(file.file_size)}</span>
                </TableCell>
                <TableCell className="w-0">
                  <div className="flex items-center justify-end">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "upload",
                            label: "Cargar",
                            onClick: () => handleUpload(file.id),
                            disabled: isUploading
                          },
                          {
                            key: "download",
                            label: "Descargar",
                            onClick: () => handleDownload(file),
                            disabled: !file.file_url
                          }
                        ]
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Spin>
  );
}
