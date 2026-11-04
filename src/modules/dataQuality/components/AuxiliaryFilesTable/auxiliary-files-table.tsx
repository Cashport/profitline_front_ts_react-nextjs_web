import { useState } from "react";
import dayjs from "dayjs";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Dropdown, Spin, message } from "antd";
import { useTranslations } from "use-intl";

import { uploadAuxiliaryFile } from "@/services/dataQuality/dataQuality";
import { useAuxiliaryFiles } from "../../hooks/useAuxiliaryFiles";
import { AuxiliaryUploadModal } from "../AuxiliaryUploadModal/AuxiliaryUploadModal";

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
import { IAuxiliaryFile, IAuxiliaryUploadBatchSummary } from "@/types/dataQuality/IDataQuality";

const bytesToMB = (bytes: number | null): string => {
  if (!bytes) return "-";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (isoDateString: string | null): string => {
  return isoDateString ? dayjs(isoDateString).format("YYYY-MM-DD") : "-";
};

/**
 * Estado del ultimo cargue asincrono. Los estados intermedios se muestran como
 * "En proceso" para no confundir "recibido" con "entregado al SFTP".
 */
type AuxFilesT = ReturnType<typeof useTranslations<"dataQuality.auxiliaryFiles">>;

const batchStatusView = (
  batch: IAuxiliaryUploadBatchSummary | null | undefined,
  t: AuxFilesT
): { label: string; color: string } | null => {
  if (!batch) return null;
  switch (batch.status) {
    case "completed":
      return { label: t("batchStatus.completed"), color: "#12B76A" };
    case "completed_with_errors":
      return {
        label: t("batchStatus.completedWithErrors", { count: batch.failed_count }),
        color: "#B42318"
      };
    case "incomplete":
      return { label: t("batchStatus.incomplete"), color: "#B54708" };
    case "processing":
    case "queued":
    case "uploading":
      return { label: t("batchStatus.processing"), color: "#175CD3" };
    default:
      return null;
  }
};

export function AuxiliaryFilesTable() {
  const t = useTranslations("dataQuality.auxiliaryFiles");
  const tCommon = useTranslations("common");
  const { auxiliaryFiles, isLoading, isValidating, mutate } = useAuxiliaryFiles();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<IAuxiliaryFile | null>(null);
  const [uploadBatchId, setUploadBatchId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const showStatus = (auxiliaryFiles ?? []).some((file) => file.async_upload || file.last_batch);

  const openLegacyUpload = (id: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        const hide = message.open({ type: "loading", content: t("uploading"), duration: 0 });
        try {
          await uploadAuxiliaryFile(id, file);
          message.success(t("uploaded"));
          mutate();
        } catch (error) {
          message.error(error instanceof Error ? error.message : t("uploadError"));
        } finally {
          hide();
          setIsUploading(false);
        }
      }
      input.remove();
    };
    input.click();
  };

  const handleUpload = (file: IAuxiliaryFile) => {
    if (file.has_route === false) {
      message.error(t("noSftpRoute", { fileType: file.file_type }));
      return;
    }
    if (file.async_upload) {
      setUploadTarget(file);
      setUploadBatchId(null);
      setUploadModalOpen(true);
      return;
    }
    openLegacyUpload(file.id);
  };

  const handleViewBatch = (file: IAuxiliaryFile) => {
    if (!file.last_batch) return;
    setUploadTarget(file);
    setUploadBatchId(file.last_batch.id);
    setUploadModalOpen(true);
  };

  const handleDownload = async (file: IAuxiliaryFile) => {
    if (!file.file_url) {
      message.error(t("noFileToDownload"));
      return;
    }
    const hide = message.open({ type: "loading", content: t("downloading"), duration: 0 });
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
      message.error(error instanceof Error ? error.message : t("downloadError"));
    } finally {
      hide();
    }
  };

  return (
    <Spin spinning={isLoading || isValidating}>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>
              {t("columns.fileType")}
            </TableHead>
            <TableHead className="w-[124px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("columns.fileDate")}
            </TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>{t("columns.name")}</TableHead>
            <TableHead className="w-[124px]" style={{ color: "#141414", fontWeight: 600 }}>
              {t("columns.uploadDate")}
            </TableHead>
            <TableHead className="w-24" style={{ color: "#141414", fontWeight: 600 }}>
              {t("columns.size")}
            </TableHead>
            {showStatus && (
              <TableHead className="w-[150px]" style={{ color: "#141414", fontWeight: 600 }}>
                {t("columns.status")}
              </TableHead>
            )}
            <TableHead className="w-20" style={{ color: "#141414", fontWeight: 600 }}>
              {t("columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && !auxiliaryFiles?.length ? (
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableCell colSpan={showStatus ? 7 : 6} className="py-10 text-center text-gray-500">
                {t("empty")}
              </TableCell>
            </TableRow>
          ) : (
            auxiliaryFiles?.map((file) => {
              const statusView = batchStatusView(file.last_batch, t);

              return (
                <TableRow
                  key={file.id}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[13px] text-white"
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
                  <TableCell
                    className="overflow-hidden text-ellipsis"
                    title={file.description || undefined}
                  >
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
                  {showStatus && (
                    <TableCell>
                      {statusView ? (
                        <span
                          className="flex items-center gap-2 text-[13px]"
                          style={{ color: "#141414" }}
                        >
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: statusView.color }}
                          />
                          {statusView.label}
                        </span>
                      ) : (
                        <span className="text-[13px] text-gray-400">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="w-0">
                    <div className="flex items-center justify-end">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "upload",
                              label: tCommon("actions.upload"),
                              onClick: () => handleUpload(file),
                              disabled: isUploading
                            },
                            {
                              key: "view",
                              label: t("viewFiles"),
                              onClick: () => handleViewBatch(file),
                              disabled: !file.last_batch
                            },
                            {
                              key: "download",
                              label: tCommon("actions.download"),
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
              );
            })
          )}
        </TableBody>
      </Table>

      <AuxiliaryUploadModal
        isOpen={uploadModalOpen}
        auxiliaryFile={uploadTarget}
        initialBatchId={uploadBatchId}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadTarget(null);
          setUploadBatchId(null);
        }}
        onFinished={() => mutate()}
      />
    </Spin>
  );
}
