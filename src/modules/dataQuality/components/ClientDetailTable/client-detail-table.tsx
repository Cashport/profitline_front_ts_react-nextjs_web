import { useState } from "react";
import dayjs from "dayjs";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Dropdown, message } from "antd";

import {
  deleteIntakeFile,
  downloadCSV,
  uploadIntakeFile
} from "@/services/dataQuality/dataQuality";

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
import { IClientDetailArchiveClient } from "@/types/dataQuality/IDataQuality";

interface IClientDetailTableProps {
  files?: IClientDetailArchiveClient[];
  mutate: () => void;
}

const getCategoryBadge = (category: string) => {
  const colors = {
    Stock: "bg-blue-100 text-blue-800",
    Sales: "bg-purple-100 text-purple-800",
    "In transit": "bg-orange-100 text-orange-800"
  };

  return (
    <Badge
      variant="secondary"
      className={`text-xs ${colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
    >
      {category}
    </Badge>
  );
};

const bytesToMB = (bytes: number): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (isoDateString: string): string => {
  return dayjs(isoDateString).format("YYYY-MM-DD");
};

export function ClientDetailTable({ files, mutate }: IClientDetailTableProps) {
  const [isUploadingLoading, setIsUploadingLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleUploadIntake = async (id: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploadingLoading(true);
        try {
          await uploadIntakeFile(id, file);
          message.success("Archivo de ingesta subido exitosamente.");
          mutate();
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : "Error al subir el archivo de ingesta. Por favor, inténtalo de nuevo."
          );
        }
        setIsUploadingLoading(false);
      }
      input.remove();
    };
    input.click();
  };

  const handleProcessedFile = async (fileId: number) => {
    try {
      const res = await downloadCSV(fileId);
      // Aquí puedes implementar la lógica para descargar el archivo, por ejemplo:
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `archivo_${fileId}.csv`); // Nombre del archivo a descargar
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
    }
  };

  const handleDownloadOriginal = async (file: IClientDetailArchiveClient) => {
    if (file.procesed_url) {
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
      }
    } else {
      message.error("No hay URL disponible para descargar el archivo original.");
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    console.log("Deleting file with ID:", fileId);
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

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6" style={{ color: "#141414" }}>
        Archivos
      </h2>
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
              <TableCell>{getCategoryBadge(file.tipo_archivo)}</TableCell>
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
                <Badge variant="outline" className="text-xs">
                  {file.status_description}
                </Badge>
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
                          onClick: () => handleProcessedFile(file.id)
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
