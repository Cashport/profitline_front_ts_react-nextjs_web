import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Dropdown, Spin, message } from "antd";
import { useTranslations } from "use-intl";

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
import { ModalFileHistory } from "../ModalFileHistory";
import { useAppStore } from "@/lib/store/store";
import { canUploadDataFiles, hasDataQualityManagementPermission } from "@/utils/utils";

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
import { Eye } from "@phosphor-icons/react";

dayjs.extend(timezone);
dayjs.extend(utc);

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
  return dayjs(isoDateString).tz("America/Bogota").format("YYYY-MM-DD");
};

const formatDateTime = (isoDateString: string): string => {
  return dayjs(isoDateString).tz("America/Bogota").format("YYYY-MM-DD HH:mm");
};

export function ClientDetailTable({
  archives: files,
  clientName,
  mutateDetail,
  onMutate,
  loading
}: IClientDetailTableProps) {
  const t = useTranslations("dataQuality.clientFilesTable");
  const tCommon = useTranslations("common");
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
  const [isFileHistoryModalOpen, setIsFileHistoryModalOpen] = useState(false);

  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const canUpload = canUploadDataFiles(selectedProject);
  const canManage = hasDataQualityManagementPermission(selectedProject);

  const buildMenuItems = (file: IClientDetailArchiveClient) => {
    const items: any[] = [];
    const cargarChildren: any[] = [];

    if (canUpload) {
      cargarChildren.push({
        key: "upload",
        label: t("menu.customerFile"),
        onClick: () => handleUploadIntake(file.id)
      });
      cargarChildren.push({
        key: "upload-generic",
        label: t("menu.universal"),
        onClick: () => handleUploadGenericIntake(file.id)
      });
    }
    if (canManage) {
      cargarChildren.push({
        key: "load-evidence",
        label: t("menu.auditSupport"),
        onClick: () => handleUploadEvidence(file.id),
        disabled: isUploadingEvidenceLoading
      });
    }
    if (cargarChildren.length) {
      items.push({
        key: "group-cargar",
        type: "group",
        label: <span className="font-semibold text-black">{t("menu.upload")}</span>,
        children: cargarChildren
      });
    }

    items.push({
      key: "group-descargas",
      type: "group",
      label: <span className="font-semibold text-black">{t("menu.downloads")}</span>,
      children: [
        {
          key: "download-original",
          label: t("menu.customerFile"),
          onClick: () => handleDownloadOriginal(file)
        },
        {
          key: "download-universal",
          label: t("menu.universalCsv"),
          onClick: () => handleProcessedFile(file, "csv")
        },
        {
          key: "download-universal-excel",
          label: t("menu.universalXls"),
          onClick: () => handleProcessedFile(file, "excel")
        }
      ]
    });

    if (canManage) {
      items.push({
        key: "group-eliminar",
        type: "group",
        label: <span className="font-semibold text-black">{t("menu.delete")}</span>,
        children: [
          {
            key: "delete",
            label: t("menu.customerFile"),
            onClick: () => {
              setActiveFileId(file.id);
              setIsDeleteModalOpen(true);
            },
            disabled: isDeleteLoading
          },
          {
            key: "delete-date",
            label: t("menu.intakeDate"),
            onClick: () => {
              setActiveFileId(file.id);
              setIsDeleteDateModalOpen(true);
            },
            disabled: isDeleteDateLoading
          }
        ]
      });
    }

    return items;
  };
  // Estado propio: los otros modales resetean activeFileId a null al cerrarse.
  const [historyFile, setHistoryFile] = useState<IClientDetailArchiveClient | null>(null);

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
    const hide = message.open({ type: "loading", content: t("downloading"), duration: 0 });
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
      message.success(t("downloaded"));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t("downloadError");
      message.error(errorMessage);
    } finally {
      hide();
    }
  };

  const handleDownloadOriginal = async (file: IClientDetailArchiveClient) => {
    if (!file.procesed_url) {
      message.error(t("noOriginalUrl"));
      return;
    }
    const hide = message.open({
      type: "loading",
      content: t("downloadingOriginal"),
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
      message.error(error instanceof Error ? error.message : t("downloadError"));
    } finally {
      hide();
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    setIsDeleteLoading(true);
    const hide = message.open({
      type: "loading",
      content: t("deleting"),
      duration: 0
    });
    try {
      await deleteIntakeFile(fileId);
      message.success(t("deleted"));
      onMutate?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("deleteError"));
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
      content: t("deletingIntakeDate"),
      duration: 0
    });
    try {
      await deleteFileDateIntake(fileId);
      message.success(t("intakeDateDeleted"));
      onMutate?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("intakeDateDeleteError"));
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
          content: t("uploadingEvidence"),
          duration: 0
        });
        try {
          await uploadEvidence(id, file);
          message.success(t("evidenceUploaded"));
          onMutate?.();
        } catch (error) {
          message.error(error instanceof Error ? error.message : t("evidenceUploadError"));
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
          content: t("uploadingGeneric"),
          duration: 0
        });
        try {
          await uploadGenericIntakeFile(id, file);
          message.success(t("uploadSuccess"));
          mutateDetail?.();
          onMutate?.();
        } catch (error) {
          message.error(error instanceof Error ? error.message : t("uploadError"));
        } finally {
          hide();
        }
      }
      input.remove();
    };
    input.click();
  };

  const handleOpenFileHistoryModal = (file: IClientDetailArchiveClient) => {
    setHistoryFile(file);
    setIsFileHistoryModalOpen(true);
  };

  return (
    <div>
      <Spin spinning={!!loading}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.fileType")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.fileDate")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.name")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.uploadDate")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.user")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.size")}
              </TableHead>
              <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.status")}
              </TableHead>
              <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.actions")}
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
                    className="text-[13px] text-white"
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
                      {file.date_upload ? formatDateTime(file.date_upload) : "-"}
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
                          className="text-[13px] cursor-help"
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
                        <p className="text-[13px]">{file.last_novelty}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[13px]"
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenFileHistoryModal(file)}
                      className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Dropdown
                      menu={{
                        items: buildMenuItems(file)
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
        title={t("confirmDeleteFile")}
        okText={tCommon("actions.delete")}
        cancelText={tCommon("actions.cancel")}
        okLoading={isDeleteLoading}
      />
      <ModalConfirmAction
        isOpen={isGenericIntakeModalOpen}
        onClose={() => {
          setIsGenericIntakeModalOpen(false);
          setActiveFileId(null);
        }}
        onOk={handleConfirmGenericIntake}
        title={t("confirmGenericTitle")}
        content={<p>{t("confirmGenericContent")}</p>}
        okText={tCommon("actions.continue")}
        cancelText={tCommon("actions.cancel")}
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
        title={t("confirmDeleteIntakeDate")}
        okText={tCommon("actions.delete")}
        cancelText={tCommon("actions.cancel")}
        okLoading={isDeleteDateLoading}
      />
      <InvoiceDownloadModal
        isModalOpen={isModalFileDetailOpen}
        handleCloseModal={setIsModalFileDetailOpen}
        title={t("auditSupportTitle")}
        url={fileURL}
      />
      <ModalFileHistory
        isOpen={isFileHistoryModalOpen}
        onClose={() => {
          setIsFileHistoryModalOpen(false);
          setHistoryFile(null);
        }}
        file={historyFile}
      />
    </div>
  );
}
