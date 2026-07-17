import { useState } from "react";
import dayjs from "dayjs";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Dropdown, Spin, message } from "antd";

import {
  deleteFileDateIntake,
  deleteIntakeFile,
  downloadCSV,
  downloadExcel,
  uploadEvidence,
  uploadGenericIntakeFile
} from "@/services/dataQuality/dataQuality";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { ModalUploadIntakeFiles } from "@/components/molecules/modals/ModalUploadIntakeFiles/ModalUploadIntakeFiles";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal";

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
import { Receipt } from "phosphor-react";

interface IClientDetailTableProps {
  archives: IClientDetailArchiveClient[];
  clientName?: string | null;
  mutateDetail?: () => void;
  onMutate?: () => void;
  loading?: boolean;
}

const bytesToMB = (bytes: number): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (isoDateString: string): string => {
  return dayjs(isoDateString).format("YYYY-MM-DD");
};

export function ClientDetailTable({
  archives: files,
  clientName,
  mutateDetail,
  onMutate,
  loading
}: IClientDetailTableProps) {
  const [isUploadingEvidenceLoading, setIsUploadingEvidenceLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteDateModalOpen, setIsDeleteDateModalOpen] = useState(false);
  const [isDeleteDateLoading, setIsDeleteDateLoading] = useState(false);
  const [isUploadIntakeModalOpen, setIsUploadIntakeModalOpen] = useState(false);
  const [isGenericIntakeModalOpen, setIsGenericIntakeModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [isModalFileDetailOpen, setIsModalFileDetailOpen] = useState(false);
  const [fileURL, setFileURL] = useState("");

  const handleUploadIntake = (id: number) => {
    setActiveFileId(id);
    setIsUploadIntakeModalOpen(true);
  };

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setFileURL(documentUrl);
      if (!isModalFileDetailOpen) setIsModalFileDetailOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
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
    const hide = message.open({
      type: "loading",
      content: "Eliminando archivo...",
      duration: 0
    });
    try {
      await deleteIntakeFile(fileId);
      message.success("Archivo eliminado exitosamente.");
      onMutate?.();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el archivo. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (activeFileId !== null) {
      handleDeleteFile(activeFileId);
    }
    setIsDeleteModalOpen(false);
  };

  const handleDeleteFileDate = async (fileId: number) => {
    setIsDeleteDateLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Eliminando fecha de ingesta...",
      duration: 0
    });
    try {
      await deleteFileDateIntake(fileId);
      message.success("Fecha de ingesta eliminada exitosamente.");
      onMutate?.();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar la fecha de ingesta. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
      setIsDeleteDateLoading(false);
    }
  };

  const handleConfirmDeleteDate = () => {
    if (activeFileId !== null) {
      handleDeleteFileDate(activeFileId);
    }
    setIsDeleteDateModalOpen(false);
  };

  const handleUploadEvidence = async (id: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploadingEvidenceLoading(true);
        const hide = message.open({
          type: "loading",
          content: "Subiendo evidencia...",
          duration: 0
        });
        try {
          await uploadEvidence(id, file);
          message.success("Evidencia cargada exitosamente.");
          onMutate?.();
        } catch (error) {
          message.error(
            error instanceof Error
              ? error.message
              : "Error al cargar la evidencia. Por favor, inténtalo de nuevo."
          );
        } finally {
          hide();
          setIsUploadingEvidenceLoading(false);
        }
      }
      input.remove();
    };
    input.click();
  };

  const handleUploadGenericIntake = (id: number) => {
    setActiveFileId(id);
    setIsGenericIntakeModalOpen(true);
  };

  const handleConfirmGenericIntake = () => {
    const id = activeFileId;
    setIsGenericIntakeModalOpen(false);
    if (id === null) return;

    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const hide = message.open({
          type: "loading",
          content: "Subiendo ingesta genérica...",
          duration: 0
        });
        try {
          await uploadGenericIntakeFile(id, file);
          message.success("Carga exitosa.");
          mutateDetail?.();
          onMutate?.();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al cargar.");
        } finally {
          hide();
        }
      }
      input.remove();
    };
    input.click();
  };

  return (
    <div>
      <Spin spinning={!!loading}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha archivo</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha cargue</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Usuario</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tamaño</TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>Estado</TableHead>
              <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files?.map((file) => (
              <TableRow
                key={file.id}
                className="hover:bg-gray-50"
                style={{ borderColor: "#DDDDDD" }}
              >
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
                  <span style={{ color: "#141414" }}>{file.uploader_user || "-"}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{bytesToMB(file.size)}</span>
                </TableCell>
                <TableCell>
                  {file.last_novelty ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs cursor-help"
                          style={{
                            color: file.status_color,
                            backgroundColor: file.status_bg_color,
                            borderColor: "transparent"
                          }}
                        >
                          {file.status_description}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-cashport-black text-white">
                        <p className="text-xs">{file.last_novelty}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        color: file.status_color,
                        backgroundColor: file.status_bg_color,
                        borderColor: "transparent"
                      }}
                    >
                      {file.status_description}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="w-0">
                  <div className="flex items-center justify-end gap-1">
                    {file.evidence_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => file.evidence_url && handleDocumentClick(file.evidence_url)}
                        className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                    )}
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "group-cargar",
                            type: "group",
                            label: <span className="font-semibold text-black">Cargar</span>,
                            children: [
                              {
                                key: "upload",
                                label: "Archivo cliente",
                                onClick: () => handleUploadIntake(file.id)
                              },
                              {
                                key: "upload-generic",
                                label: "Universal",
                                onClick: () => handleUploadGenericIntake(file.id)
                              },
                              {
                                key: "load-evidence",
                                label: "Soporte auditoria",
                                onClick: () => handleUploadEvidence(file.id),
                                disabled: isUploadingEvidenceLoading
                              }
                            ]
                          },
                          {
                            key: "group-descargas",
                            type: "group",
                            label: <span className="font-semibold text-black">Descargas</span>,
                            children: [
                              {
                                key: "download-original",
                                label: "Archivo cliente",
                                onClick: () => handleDownloadOriginal(file)
                              },
                              {
                                key: "download-universal",
                                label: "Universal .csv",
                                onClick: () => handleProcessedFile(file, "csv")
                              },
                              {
                                key: "download-universal-excel",
                                label: "Universal .xls",
                                onClick: () => handleProcessedFile(file, "excel")
                              }
                            ]
                          },
                          {
                            key: "group-eliminar",
                            type: "group",
                            label: <span className="font-semibold text-black">Eliminar</span>,
                            children: [
                              {
                                key: "delete",
                                label: "Archivo cliente",
                                onClick: () => {
                                  setActiveFileId(file.id);
                                  setIsDeleteModalOpen(true);
                                },
                                disabled: isDeleteLoading
                              },
                              {
                                key: "delete-date",
                                label: "Fecha ingesta",
                                onClick: () => {
                                  setActiveFileId(file.id);
                                  setIsDeleteDateModalOpen(true);
                                },
                                disabled: isDeleteDateLoading
                              }
                            ]
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
            ))}
          </TableBody>
        </Table>
      </Spin>
      <ModalConfirmAction
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveFileId(null);
        }}
        onOk={handleConfirmDelete}
        title="¿Está seguro de eliminar este archivo?"
        okText="Eliminar"
        cancelText="Cancelar"
        okLoading={isDeleteLoading}
      />
      <ModalConfirmAction
        isOpen={isGenericIntakeModalOpen}
        onClose={() => {
          setIsGenericIntakeModalOpen(false);
          setActiveFileId(null);
        }}
        onOk={handleConfirmGenericIntake}
        title="Confirmar carga de ingesta genérica"
        content={
          <p>
            Al usar este método de carga usted es responsable de la exactitud de los datos cargados.
            ¿Desea continuar?
          </p>
        }
        okText="Continuar"
        cancelText="Cancelar"
      />
      <ModalUploadIntakeFiles
        isOpen={isUploadIntakeModalOpen}
        archiveId={activeFileId}
        onClose={() => {
          setIsUploadIntakeModalOpen(false);
          setActiveFileId(null);
        }}
        onSuccess={() => {
          mutateDetail?.();
          onMutate?.();
        }}
      />
      <ModalConfirmAction
        isOpen={isDeleteDateModalOpen}
        onClose={() => {
          setIsDeleteDateModalOpen(false);
          setActiveFileId(null);
        }}
        onOk={handleConfirmDeleteDate}
        title="¿Está seguro de eliminar la fecha de ingesta?"
        okText="Eliminar"
        cancelText="Cancelar"
        okLoading={isDeleteDateLoading}
      />
      <InvoiceDownloadModal
        isModalOpen={isModalFileDetailOpen}
        handleCloseModal={setIsModalFileDetailOpen}
        title="Soporte auditoría"
        url={fileURL}
      />
    </div>
  );
}
